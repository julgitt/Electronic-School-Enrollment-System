import {SchoolRepository} from "../repositories/schoolRepository";
import {ProfileService} from "./profileService";
import {SchoolWithProfiles} from "../dto/school/schoolWithProfiles";
import {ResourceNotFoundError} from "../errors/resourceNotFoundError";
import {School} from "../dto/school/school";
import {ITask} from "pg-promise";

export class SchoolService {
    constructor(
        private schoolRepository: SchoolRepository,
        private profileService: ProfileService,
        private readonly tx: (callback: (t: ITask<any>) => Promise<void>) => Promise<void>) {
    }

    async getAllSchools(): Promise<School[]> {
        return await this.schoolRepository.getAll();
    }

    async getAllSchoolsWithProfiles(): Promise<SchoolWithProfiles[]> {
        let schools: School[] = await this.schoolRepository.getAll();
        let schoolsWithProfiles: SchoolWithProfiles[] = [];
        for (let school of schools) {
            schoolsWithProfiles.push({
                id: school.id,
                name: school.name,
                profiles: await this.profileService.getProfilesBySchool(school.id),
            });
        }
        return schoolsWithProfiles
    }

    async getSchoolWithProfiles(id: number): Promise<SchoolWithProfiles> {
        const school: School | null = await this.schoolRepository.getById(id);

        if (!school) throw new ResourceNotFoundError('Szkoła nie znaleziona');

        return {
            id: school.id,
            name: school.name,
            profiles: await this.profileService.getProfilesBySchool(school.id),
        }
    }

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