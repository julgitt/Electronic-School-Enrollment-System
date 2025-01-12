import {ProfileRepository} from "../repositories/profileRepository";
import {ProfileCriteriaEntity, ProfileCriteriaType} from "../models/profileCriteriaEntity";
import {Profile} from "../dto/profile/profile";
import {ResourceNotFoundError} from "../errors/resourceNotFoundError";
import {ProfileCriteria} from "../dto/criteriaByProfile";
import {Grade} from "../dto/grade/grade";
import {ApplicationService} from "./applicationService";
import {GradeService} from "./gradeService";
import {Application} from "../dto/application/application";
import {ProfileRequest} from "../dto/profile/profileRequest";
import {transactionFunction} from "../db";
import {ProfileWithCriteria} from "../dto/profile/profileWithCriteria";
import {CandidateService} from "./candidateService";
import {RankedApplication, RankList, RankListWithInfo} from "../dto/application/rankedApplication";
import {GRADE_TO_POINTS} from "../../../adminConstants";
import {GradeType} from "../dto/grade/gradeType";
import {GradesInfo, PointsInfo} from "../dto/grade/pointsInfo";
import {SubjectService} from "./subjectService";
import {ProfileWithInfo} from "../dto/profile/profileInfo";
import {SchoolService} from "./schoolService";
import {DataConflictError} from "../errors/dataConflictError";

export class ProfileService {
    private applicationService!: ApplicationService;
    private schoolService!: SchoolService;

    constructor(
        private profileRepository: ProfileRepository,
        private gradeService: GradeService,
        private subjectService: SubjectService,
        private candidateService: CandidateService,
        private readonly tx: transactionFunction
    ) {
    }

    setApplicationService(applicationService: ApplicationService) {
        this.applicationService = applicationService;
    }

    setSchoolService(schoolService: SchoolService) {
        this.schoolService = schoolService;
    }

    /**
     *  Pobiera dane profilu na podstawie identyfikatora profilu.
     *
     * @param {number} id - identyfikator profilu.
     * @returns {Promise<Profile>} Zwraca obiekt profilu.
     *
     * @throws {ResourceNotFoundError} Jeśli nie znaleziono profilu o podanym identyfikatorze.
     */
    async getProfile(id: number): Promise<Profile> {
        const profile = await this.profileRepository.getById(id);
        if (!profile) throw new ResourceNotFoundError('Profil nie znaleziony.');
        return profile;
    }

    /**
     *  Pobiera dane wszystkich profili.
     *
     * @returns {Promise<Profile>} Zwraca tablicę obiektów profilu.
     */
    async getAllProfiles(): Promise<Profile[]> {
        return this.profileRepository.getAll();
    }

    /**
     *  Pobiera dane profilu wraz z jego kryteriami rekrutacyjnymi na podstawie identyfikatora profilu oraz identyfikatora szkoły do której należy profil.
     *
     * @param {number} id - identyfikator profilu.
     * @param {number} schoolId - identyfikator szkoły do której należy profil.
     * @returns {Promise<ProfileWithCriteria>} Zwraca obiekt profilu wraz z jego kryteriami rekrutacyjnymi.
     *
     * @throws {ResourceNotFoundError} Jeśli nie znaleziono profilu o podanym identyfikatorze
     * lub gdy profil o podanym identyfikatorze należy do innej szkoły, niż podanej.
     */
    async getProfileByIdAndSchoolId(id: number, schoolId: number): Promise<ProfileWithCriteria> {
        const profile = await this.profileRepository.getById(id);
        if (!profile || profile.schoolId != schoolId) throw new ResourceNotFoundError('Profil nie znaleziony.');

        return {
            ...profile,
            criteria: await this.getProfileCriteria(id)
        };
    }

    /**
     *  Pobiera dane pierwszego znalezionego w bazie danych profilu wraz z jego kryteriami rekrutacyjnymi na podstawie identyfikatora szkoły.
     *
     * @param {number} schoolId - identyfikator szkoły.
     * @returns {Promise<ProfileWithCriteria | null>} Zwraca obiekt profilu wraz z jego kryteriami rekrutacyjnymi, lub null, jeśli nie znaleziono profilu.
     */
    async getProfileBySchool(schoolId: number): Promise<ProfileWithCriteria | null> {
        const profile = await this.profileRepository.getBySchool(schoolId);
        if (!profile) return null;

        return {
            ...profile,
            criteria: await this.getProfileCriteria(profile.id)
        };
    }

    /**
     *  Pobiera dane wszystkich profili wraz z ich kryteriami rekrutacyjnymi na podstawie identyfikatora szkoły.
     *
     * @param {number} schoolId - identyfikator szkoły.
     * @returns {Promise<ProfileWithCriteria[]>} Zwraca tablicę obiektów profili wraz z ich kryteriami rekrutacyjnymi.
     */
    async getAllProfilesBySchool(schoolId: number): Promise<Profile[]> {
        return this.profileRepository.getAllBySchool(schoolId);
    }

    /**
     *  Pobiera dane wszystkich profili wraz z dodatkowymi informacjami, takimi jak:
     *
     *   - id: (number) - identyfikator profilu
     *   - name: (string) - nazwa profilu
     *   - schoolId: (number) - identyfikator szkoły do której należy profil
     *   - schoolName: (string) - nazwa szkoły do której należy profil
     *   - applicationNumber: (number) - ilość oczekujących aplikacji złożonych do tego profilu
     *   - criteriaSubjects: (string[]) - nazwy przedmiotów które należą do kryteriów rekrutacyjnych profilu
     *
     * @returns {Promise<ProfileWithInfo[]>} Zwraca tablicę obiektów profilu wraz z dodatkowymi informacjami.
     */
    async getProfilesWithInfo(): Promise<ProfileWithInfo[]> {
        const profiles = await this.getAllProfiles()
        return await Promise.all(profiles.map(async p => {
            const school = (await this.schoolService.getSchool(p.schoolId))

            const criteria = await this.getProfileCriteria(p.id);
            const criteriaSubjects = await Promise.all(criteria.map(async c => {
                const subject = await this.subjectService.getSubject(c.subjectId);
                return subject.name;
            }));
            const applicationNumber = (await this.applicationService.getAllPendingByProfile(p.id)).length;

            return {
                id: p.id,
                name: p.name,
                schoolId: school.id,
                schoolName: school.name,
                criteriaSubjects,
                applicationNumber
            }
        }));
    }

    /**
     *  Usuwa profil z bazy danych na podstawie podanego identyfikatora profilu oraz identyfikatora szkoły.
     *  Identyfikator szkoły służy do potwierdzenia czy jednostka szkolna ma uprawnienia do usunięcia tego profilu (tj. czy profil należy do tej szkoły).
     *
     * @param {number} id - identyfikator profilu.
     * @param {number} schoolId - identyfikator szkoły do której należy profil.
     * @returns {Promise<void>}
     *
     * @throws {ResourceNotFoundError} Jeśli nie znaleziono profilu o podanym identyfikatorze, lub znaleziony profil należy do innej szkoły.
     */
    async deleteProfile(id: number, schoolId: number): Promise<void> {
        const profile = await this.profileRepository.getById(id);
        if (!profile || profile.schoolId != schoolId) throw new ResourceNotFoundError("Nie znaleziono profilu do usunięcia.");
        await this.profileRepository.delete(id, schoolId);
    }

    /**
     *  Dodaje podany profil do bazy danych.
     *
     * @param {ProfileRequest} profile - Obiekt dodawanego profilu, który zawiera:
     *
     * - id: (number) - identyfikator profilu (wartość nie ma znaczenia, zostaje nadany nowy identyfikator na bazie danych).
     * - name: (string) - nazwa profilu
     * - capacity: (number) - liczba miejsc do rekrutacji w profilu
     * - criteria: (ProfileCriteria[]) - tablica obiektów kryteriów rekrutacyjnych dla profilu
     * @param {number} schoolId - identyfikator szkoły, do której dodajemy profil.
     * @returns {Promise<number>} identyfikator dodanego profilu nadany przez bazę danych.
     *
     * @throws {DataConflictError} Jeśli profil o podanej nazwie już istnieje dla danej szkoły.
     */
    async addProfile(profile: ProfileRequest, schoolId: number): Promise<number> {
        let insertedProfileId = 0;
        if (await this.profileRepository.getBySchoolAndName(schoolId, profile.name))
            throw new DataConflictError("Profil o podanej nazwie już istnieje.");

        const newProfile: Profile = {
            id: 0,
            name: profile.name,
            capacity: profile.capacity,
            schoolId: schoolId,
        }

        await this.tx(async t => {
            insertedProfileId = (await this.profileRepository.insert(newProfile, t)).id;

            for (const criteria of profile.criteria) {
                const newProfileCriteria: ProfileCriteriaEntity = {
                    id: 0,
                    profileId: insertedProfileId,
                    subjectId: criteria.subjectId,
                    type: criteria.type,
                }
                await this.profileRepository.insertCriteria(newProfileCriteria, t);
            }
        });
        return insertedProfileId;
    }

    /**
     *  Aktualizuje podany profil w bazie danych, jeśli należy on do podanej szkoły.
     *
     * @param {ProfileRequest} profile - Obiekt aktualizowanego profilu, który zawiera:
     *
     * - id: (number) - identyfikator profilu.
     * - name: (string) - nowa nazwa profilu
     * - capacity: (number) - nowa liczba miejsc do rekrutacji w profilu
     * - criteria: (ProfileCriteria[]) - tablica obiektów kryteriów rekrutacyjnych dla aktualizowanego profilu
     * @param {number} schoolId - identyfikator szkoły, do której należy profil.
     * @returns {Promise<void>}
     *
     * @throws {ResourceNotFoundError} Jeśli nie znaleziono profilu o podanym identyfikatorze lub profil należy do innej szkoły niż podaliśmy.
     */
    async updateProfile(profile: ProfileRequest, schoolId: number): Promise<void> {
        await this.getProfileByIdAndSchoolId(profile.id, schoolId);

        const updatedProfile: Profile = {
            id: profile.id,
            name: profile.name,
            capacity: profile.capacity,
            schoolId: schoolId,
        }

        await this.tx(async t => {
            await this.profileRepository.update(updatedProfile, t);
            await this.profileRepository.deleteCriteriaByProfile(updatedProfile.id, t);

            for (const criteria of profile.criteria) {
                const newProfileCriteria: ProfileCriteriaEntity = {
                    id: 0,
                    profileId: updatedProfile.id,
                    subjectId: criteria.subjectId,
                    type: criteria.type,
                }
                await this.profileRepository.insertCriteria(newProfileCriteria, t);
            }
        });
    }

    /**
     *  Pobiera informację o punktach, które zdobył podany kandydat do profilu.
     *
     * @param {number} id - identyfikator profilu.
     * @param {number} candidateId - identyfikator kandydata kandydującego do tego profilu.
     * @returns {Promise<PointsInfo>} Zwraca obiekt informacji o punktach, który zawiera:
     *
     * - points: (number) - ilość zdobytych punktów do profilu, obliczona w oparci o oceny kandydata oraz kryteria profilu.
     * - gradesInfo: (GradesInfo) - obiekt zawierający informacje o ocenach ze świadectwa kandydata:
     *
     *      - grade- wartość oceny
     *      - subject- przedmiot, z którego jest ocena
     *      - type- typ kryterium rekrutacyjnego jakie spełnia przedmiot dla danego profilu (czy jest to kryterium obowiązkowe, czy alternatywne)
     *
     * @throws {ResourceNotFoundError} Jeśli nie znaleziono kryteriów dla podanego profilu.
     */
    async getPoints(id: number, candidateId: number): Promise<PointsInfo> {
        const criteria = await this.getProfileCriteria(id);
        const grades: Grade[] = await this.gradeService.getAllByCandidate(candidateId);

        const gradesInfo: GradesInfo[] = (await Promise.all(grades
            .map((async g => {
                const criterion = criteria.find(c => c.subjectId == g.subjectId && g.type === GradeType.Certificate)
                return criterion ? {
                    grade: g.grade,
                    subject: (await this.subjectService.getSubject(g.subjectId)).name,
                    type: criterion.type
                } : null
            })))).filter(g => g !== null)

        return {points: this.calculatePoints(criteria, grades), gradesInfo};
    }

    /**
     *  Pobiera listę rekrutacyjną dla podanego profilu.
     *  Listy rekrutacyjne są sortowane według punktów uzyskanych przez kandydatów.
     *
     * @param {number} id - identyfikator profilu.
     * @returns {Promise<RankList>} Zwraca listę rekrutacyjną, na którą składa się:
     *
     *  - prevAccepted: lista kandydatów przyjętych w poprzednich turach
     *  - accepted: lista kandydatów kwalifikujących się w obecnej turze
     *  - reserve: lista kandydatów niekwalifikujących się, którzy są na liście rezerwowej
     *
     * @throws {ResourceNotFoundError} Jeśli nie znaleziono kryteriów dla profilu.
     */
    async getRankList(id: number): Promise<RankList> {
        const criteria = await this.getProfileCriteria(id);
        const accepted = await this.applicationService.getAllAcceptedByProfile(id);
        const pending = await this.applicationService.getAllPendingByProfile(id);

        const rankedAccepted = await this.createRankList(accepted, criteria);
        const rankedPending = await this.createRankList(pending, criteria);

        const profileCapacity = await this.getProfileCapacity(id);
        const capacity = profileCapacity - rankedAccepted.length;
        return {
            prevAccepted: rankedAccepted,
            accepted: rankedPending.slice(0, capacity),
            reserve: rankedPending.slice(capacity)
        };
    }

    /**
     *  Pobiera wszystkie listy rekrutacyjne dla każdego profilu wraz z dodatkowymi informacjami.
     *
     * @returns {Promise<Map<number, RankListWithInfo>>} Zwraca mapę, dla której:
     *
     * klucz - identyfikator profilu
     * wartość - lista rankingowa, która zawiera:
     *
     *   - profile - profil z dodatkowymi informacjami
     *   - accepted - listę zaakceptowanych kandydatów
     *   - reserve - listę rezerwową kandydatów
     *   - rejected - listę odrzuconych, początkowo ustawioną na pustą tablicę
     *
     * @throws {ResourceNotFoundError} Jeśli nie znaleziono kryteriów dla profilu.
     */
    async getAllRankLists(): Promise<Map<number, RankListWithInfo>> {
        const profiles = await this.getProfilesWithInfo();
        const rankLists = new Map<number, RankListWithInfo>();

        for (const profile of profiles) {
            const {accepted, reserve} = await this.getRankList(profile.id);
            rankLists.set(profile.id, {profile, accepted, reserve, rejected: []});
        }

        return rankLists;
    }

    private async createRankList(applications: Application[], criteria: ProfileCriteria[]) {
        const rankedApplications = await Promise.all(
            applications.map(a => this.toRankedApplication(criteria, a))
        );
        return rankedApplications.sort((a, b) => b.points - a.points);
    }

    private async toRankedApplication(criteria: ProfileCriteria[], application: Application): Promise<RankedApplication> {
        const candidate = await this.candidateService.getCandidateById(application.candidateId);
        const grades = await this.gradeService.getAllByCandidate(application.candidateId);

        const points = this.calculatePoints(criteria, grades);

        return {
            id: application.id,
            candidate,
            points,
            priority: application.priority,
            status: application.status
        }
    }

    private async getProfileCapacity(profileId: number) {
        const capacity = await this.profileRepository.getProfileCapacity(profileId);
        if (!capacity) throw new ResourceNotFoundError('Nie znaleziono liczby miejsc dla profilu.');
        return capacity
    }

    private async getProfileCriteria(profileId: number): Promise<ProfileCriteria[]> {
        const criteria: ProfileCriteriaEntity[] = await this.profileRepository.getProfileCriteria(profileId);
        if (!criteria) throw new ResourceNotFoundError('Nie znaleziono kryteriów dla profilu.');
        return criteria;
    }

    private calculatePoints(profileCriteria: ProfileCriteriaEntity[], grades: Grade[]): number {
        const mandatorySubjects = profileCriteria.filter(s => s.type === ProfileCriteriaType.Mandatory);
        const alternativeSubjects = profileCriteria.filter(s => s.type === ProfileCriteriaType.Alternative);
        let points = 0;

        let alternativeGrades = []
        for (let grade of grades) {
            if (grade.type == GradeType.Exam) {
                points += grade.grade * 0.35;
            } else if (mandatorySubjects.some(s => s.subjectId == grade.subjectId)) {
                points += GRADE_TO_POINTS[grade.grade] || 0;
            } else if (alternativeSubjects.some(s => s.subjectId == grade.subjectId)) {
                alternativeGrades.push(GRADE_TO_POINTS[grade.grade] || 0);
            }
        }
        if (alternativeGrades.length > 0) {
            points += Math.max(...alternativeGrades);
        }
        return Math.ceil(points * 100) / 100;
    }
}