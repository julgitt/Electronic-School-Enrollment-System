import {SchoolRepository} from "../repositories/schoolRepository";
import {ProfileService} from "./profileService";
import {SchoolWithProfiles} from "../dto/schoolWithProfiles";
import {SchoolEntity} from "../models/schoolEntity";

export class SchoolService {
    constructor(private schoolRepository: SchoolRepository,
                private profileService: ProfileService) {
    }

    async getAllSchoolsWithProfiles(): Promise<SchoolWithProfiles[]> {
        let schools: SchoolEntity[] = await this.schoolRepository.getAll();
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

    async getSchoolWithProfiles(id: number): Promise<SchoolWithProfiles | null> {
        const school: SchoolEntity | null = await this.schoolRepository.getById(id);

        if (school) {
            return {
                id: school.id,
                name: school.name,
                profiles: await this.profileService.getProfilesBySchool(school.id),
            }
        }
        return school
    }

    async addSchool(name: string,): Promise<void> {
        const newSchool: SchoolEntity = {
            id: 0,
            name: name,
        }

        await this.schoolRepository.insert(newSchool);
    }
}