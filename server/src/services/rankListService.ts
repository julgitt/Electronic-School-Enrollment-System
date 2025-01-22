import {ProfileCriteriaEntity, ProfileCriteriaType, ProfileCriteriaWithSubjects} from "../models/profileCriteriaEntity";
import {ProfileCriteria} from "../dto/criteriaByProfile";
import {Grade} from "../dto/grade/grade";
import {GradeService} from "./gradeService";
import {Application} from "../dto/application/application";
import {CandidateService} from "./candidateService";
import {RankedApplication, RankList, RankListWithInfo} from "../dto/application/rankedApplication";
import {GRADE_TO_POINTS} from "../../../public/adminConstants";
import {GradeType} from "../dto/grade/gradeType";
import {GradesInfo, PointsInfo} from "../dto/grade/pointsInfo";
import {SubjectService} from "./subjectService";
import {ProfileWithInfo} from "../dto/profile/profileInfo";
import { ProfileService } from "./profileService";

export class RankListService {

    constructor(
        private gradeService: GradeService,
        private subjectService: SubjectService,
        private candidateService: CandidateService,
        private profileService: ProfileService
    ) {
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
        const [criteria, grades] = await Promise.all([
            this.profileService.getProfileCriteria(id),
            this.gradeService.getAllByCandidate(candidateId)
        ]);

        const gradesInfo: GradesInfo[] = (await Promise.all(
            grades.map(async g => {
                const criterion = criteria.find(c => c.subjectId == g.subjectId && g.type === GradeType.Certificate)
                if (criterion) {
                    const subject = await this.subjectService.getSubject(g.subjectId)
                    return {grade: g.grade, subject: subject.name, type: criterion.type}
                }
                return null
            }))).filter(g => g !== null)

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
    async getRankListById(id: number): Promise<RankList> {
        const profile = await this.profileService.getProfileWithInfo(id);
       return this.getRankList(profile);
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
        const profiles = await this.profileService.getProfilesWithInfo();
        const rankLists = new Map<number, RankListWithInfo>();

        const rankListPromises = profiles.map(profile => 
            this.getRankList(profile).then(({accepted, reserve}) => ({
                profile,
                accepted,
                reserve,
                rejected: []
            }))
        );
    
        const rankListResults = await Promise.all(rankListPromises);
    
        rankListResults.forEach(({profile, accepted, reserve, rejected}) => {
            rankLists.set(profile.id, {profile, accepted, reserve, rejected});
        });

        return rankLists;
    }

    private async getRankList(profile: ProfileWithInfo) {
        const [rankedAccepted, rankedPending] = await Promise.all([
            this.createRankList(profile.accepted, profile.criteria),
            this.createRankList(profile.pending, profile.criteria)
        ]);

        const capacity = profile.capacity - rankedAccepted.length;
        return {
            prevAccepted: rankedAccepted,
            accepted: rankedPending.slice(0, capacity),
            reserve: rankedPending.slice(capacity)
        };
    }

    private async createRankList(applications: Application[], criteria: ProfileCriteria[]) {
        const rankedApplications = await Promise.all(
            applications.map(a => this.toRankedApplication(criteria, a))
        );
        return rankedApplications.sort((a, b) => b.points - a.points);
    }

    private async toRankedApplication(criteria: ProfileCriteria[], application: Application): Promise<RankedApplication> {
        const [candidate, grades] = await Promise.all([
            this.candidateService.getCandidateById(application.candidateId),
            this.gradeService.getAllByCandidate(application.candidateId)
        ]);

        const points = this.calculatePoints(criteria, grades);

        return {
            id: application.id,
            candidate,
            points,
            priority: application.priority,
            status: application.status
        }
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