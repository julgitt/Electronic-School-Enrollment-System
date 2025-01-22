import {ProfileRepository} from "../repositories/profileRepository";
import {ProfileCriteriaEntity, ProfileCriteriaWithSubjects} from "../models/profileCriteriaEntity";
import {Profile} from "../dto/profile/profile";
import {ResourceNotFoundError} from "../errors/resourceNotFoundError";
import {ApplicationService} from "./applicationService";
import {ProfileRequest} from "../dto/profile/profileRequest";
import {transactionFunction} from "../db";
import {ProfileWithCriteria} from "../dto/profile/profileWithCriteria";
import {ProfileWithInfo} from "../dto/profile/profileInfo";
import {SchoolService} from "./schoolService";
import {DataConflictError} from "../errors/dataConflictError";
import { ProfileCriteria } from "../dto/criteriaByProfile";

export class ProfileService {
    private applicationService!: ApplicationService;
    private schoolService!: SchoolService;

    constructor(
        private profileRepository: ProfileRepository,
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
     *  Pobiera dane wszystkich profili wraz z ich kryteriami rekrutacyjnymi na podstawie identyfikatora szkoły.
     *
     * @param {number} schoolId - identyfikator szkoły.
     * @returns {Promise<ProfileWithCriteria[]>} Zwraca tablicę obiektów profili wraz z ich kryteriami rekrutacyjnymi.
     */
    async getAllProfilesBySchool(schoolId: number): Promise<Profile[]> {
        return this.profileRepository.getAllBySchool(schoolId);
    }

       /**
     *  Pobiera dane wszystkich profili wraz z dodatkowymi informacjami.
     * @param {number} id - identyfikator profilu.
     * @returns {Promise<ProfileWithInfo>} Zwraca obiekt profilu wraz z dodatkowymi informacjami.
     */
    async getProfileWithInfo(id: number): Promise<ProfileWithInfo> {
        return this.createProfileWithInfo(await this.getProfile(id))
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
     *   - criteria: (ProfileCriteria[]) - tablica obiektów kryteriów
     *   - capacity: (number) - liczba miejsc
     *   - pending: (Application[]) - oczekujące aplikacje
     *   - accepted: (Application[]) - aplikacje zaakceptowane w poprzednich turach
     *   
     *
     * @returns {Promise<ProfileWithInfo[]>} Zwraca tablicę obiektów profilu wraz z dodatkowymi informacjami.
     */
    async getProfilesWithInfo(): Promise<ProfileWithInfo[]> {
        const profiles = await this.getAllProfiles()
        return await Promise.all(profiles.map(async p => {
            return this.createProfileWithInfo(p)
        }));
    }

    private async createProfileWithInfo(profile: Profile): Promise<ProfileWithInfo> {
        const [school, criteria, pending, accepted] = await Promise.all([
            this.schoolService.getSchool(profile.schoolId),
            this.getProfileCriteriaWithSubjects(profile.id),
            this.applicationService.getAllPendingByProfile(profile.id),
            this.applicationService.getAllAcceptedByProfile(profile.id),
        ]);

        return {
            id: profile.id,
            name: profile.name,
            schoolId: school.id,
            schoolName: school.name,
            criteria,
            criteriaSubjects: criteria.map(c => c.subjectName),
            applicationNumber: pending.length,
            capacity: profile.capacity,
            accepted,
            pending
        }
    }

    /**
     *  Pobiera dane o kryteriach profilu na podstawie identyfikatora profilu:
     * @returns {Promise<ProfileCriteria[]>} Zwraca tablicę obiektów kryteriów profilu.
     */
    async getProfileCriteria(profileId: number): Promise<ProfileCriteria[]> {
        const criteria: ProfileCriteriaEntity[] = await this.profileRepository.getProfileCriteria(profileId);
        if (!criteria) throw new ResourceNotFoundError('Nie znaleziono kryteriów dla profilu.');
        return criteria;
    }

    private async getProfileCriteriaWithSubjects(profileId: number): Promise<ProfileCriteriaWithSubjects[]> {
        const criteria: ProfileCriteriaWithSubjects[] = await this.profileRepository.getProfileCriteriaWithSubject(profileId);
        if (!criteria) throw new ResourceNotFoundError('Nie znaleziono kryteriów dla profilu.');
        return criteria;
    }
}