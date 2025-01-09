import {SchoolRepository} from "../repositories/schoolRepository";
import {ProfileService} from "./profileService";
import {SchoolWithProfiles} from "../dto/school/schoolWithProfiles";
import {ResourceNotFoundError} from "../errors/resourceNotFoundError";
import {School} from "../dto/school/school";
import {transactionFunction} from "../db";

export class SchoolService {
    constructor(
        private schoolRepository: SchoolRepository,
        private profileService: ProfileService,
        private readonly tx: transactionFunction
    ) {
    }

    /**
     * Pobiera dane szkoły na podstawie identyfikatora
     *
     * @param {number} id - identyfikator szkoły.
     * @returns {Promise<School>} Zwraca obiekt szkoły.
     *
     * @throws {ResourceNotFoundError} Jeśli nie znaleziono szkoły o podanym identyfikatorze.
     */
    async getSchool(id: number): Promise<School> {
        const school = await this.schoolRepository.getById(id);
        if (!school) throw new ResourceNotFoundError("Nie znaleziono szkoły")
        return school;
    }

    /**
     *  Pobiera dane wszystkich szkół.
     *
     * @returns {Promise<School[]>} Zwraca tablicę obiektów szkół.
     */
    async getAllSchools(): Promise<School[]> {
        return await this.schoolRepository.getAll();
    }

    /**
     *  Pobiera dane szkoły razem z powiązanymi profilami na podstawie identyfikatora szkoły.
     *
     * @param {number} id - identyfikator szkoły.
     * @returns {Promise<SchoolWithProfiles>} Zwraca obiekt szkoły razem z profilami.
     *
     * @throws {ResourceNotFoundError} Jeśli nie znaleziono szkoły o podanym identyfikatorze.
     */
    async getSchoolWithProfiles(id: number): Promise<SchoolWithProfiles> {
        const school: School | null = await this.schoolRepository.getById(id);

        if (!school) throw new ResourceNotFoundError('Szkoła nie znaleziona');

        return {
            id: school.id,
            name: school.name,
            profiles: await this.profileService.getAllProfilesBySchool(school.id),
        }
    }

    /**
     *  Pobiera dane wszystkich szkół razem z powiązanymi profilami.
     *
     * @returns {Promise<SchoolWithProfiles[]>} Zwraca tablicę obiektów szkół razem z ich profilami.
     */
    async getAllSchoolsWithProfiles(): Promise<SchoolWithProfiles[]> {
        let schools: School[] = await this.schoolRepository.getAll();
        let schoolsWithProfiles: SchoolWithProfiles[] = [];
        for (let school of schools) {
            schoolsWithProfiles.push({
                id: school.id,
                name: school.name,
                profiles: await this.profileService.getAllProfilesBySchool(school.id),
            });
        }
        return schoolsWithProfiles
    }

    /**
     *  Pobiera dane szkoły na podstawie identyfikatora szkoły oraz identyfikatora administratora tej szkoły.
     *
     * @param {number} id - identyfikator szkoły.
     * @param {number} adminId - identyfikator administratora szkolnego zarządzającego tą szkołą.
     * @returns {Promise<School>} Zwraca obiekt szkoły.
     *
     * @throws {ResourceNotFoundError} Jeśli nie znaleziono szkoły o podanym identyfikatorze i administratorze.
     */
    async getSchoolByAdminAndId(id: number, adminId: number): Promise<School> {
        const school: School | null = await this.schoolRepository.getByIdAndAdmin(id, adminId);
        if (school == null) throw new ResourceNotFoundError('Szkoła nie znaleziona');
        return {
            id: school.id,
            name: school.name,
        }
    }

    /**
     *  Pobiera dane pierwszej szkoły z bazy danych, która jest zarządzana przez podanego administratora szkolnego.
     *
     * @param {number} adminId - id administratora szkolnego.
     * @returns {Promise<School | null>} Zwraca obiekt szkoły, jeśli istnieje szkoła zarządzana przez podanego administratora, lub null wpp.
     */
    async getSchoolByAdmin(adminId: number): Promise<School | null> {
        return this.schoolRepository.getFirstByAdmin(adminId);
    }

    /**
     *  Pobiera dane wszystkich szkół zarzadzanych przez podanego admministratora szkolnego.
     *
     * @param {number} adminId - id administratora szkolnego.
     * @returns {Promise<School[]>} Zwraca tablicę obiektów szkół zarządzanych przez podanego administratora.
     */
    async getSchoolsByAdmin(adminId: number): Promise<School[]> {
        return await this.schoolRepository.getAllByAdmin(adminId);
    }

    /**
     *  Aktualizuje podane szkoły poprzez:
     *  - dodanie szkół, których id nie jest obecne w bazie danych
     *  - usunięcie szkół, których nie ma w podanych szkołach, a które są obecne w bazie danych
     *  - zaktualizowanie szkół których id jest obecne w podanych szkołach oraz w bazie danych.
     *
     * @param {School[]} schools - tablica obiektów szkół do aktualizowania.
     * Każdy obiekt zawiera:
     *  - `id` (number) - identyfikator szkoły
     *  - `name` (string) nowa nazwa szkoły
     * @returns {Promise<void>}
     */
    async updateSchools(schools: School[]): Promise<void> {
        const currentSchools = await this.getAllSchools();
        const currentSchoolIds = currentSchools.map(s => s.id);
        const newSchoolIds = schools.map(s => s.id);

        const schoolsToUpdate = schools.filter(s =>
            currentSchoolIds.includes(s.id)
        );
        const schoolsToDelete = currentSchools.filter(s =>
            !newSchoolIds.includes(s.id)
        );
        const schoolsToAdd = schools.filter(s =>
            !currentSchoolIds.includes(s.id)
        );

        await this.tx(async t => {
            for (const school of schoolsToDelete) {
                await this.schoolRepository.delete(school.id, t);
            }
            for (const school of schoolsToUpdate) {
                await this.schoolRepository.update(school, t);
            }
            for (const school of schoolsToAdd) {
                await this.schoolRepository.insert(school, t);
            }
        });
    }
}