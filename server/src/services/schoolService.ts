import {SchoolRepository} from "../repositories/schoolRepository";
import {ProfileService} from "./profileService";
import {SchoolWithProfiles} from "../dto/schoolWithProfiles";
import {SchoolEntity} from "../models/schoolEntity";
import {ResourceNotFoundError} from "../errors/resourceNotFoundError";

export class SchoolService {
    constructor(
        private schoolRepository: SchoolRepository,
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

    async getSchoolWithProfiles(id: number): Promise<SchoolWithProfiles> {
        const school: SchoolEntity | null = await this.schoolRepository.getById(id);

        if (!school) throw new ResourceNotFoundError('Szkoła nie znaleziona');

        return {
            id: school.id,
            name: school.name,
            profiles: await this.profileService.getProfilesBySchool(school.id),
        }
    }

    async addSchool(name: string): Promise<void> {
        const newSchool: SchoolEntity = {
            id: 0,
            name: name,
        }

        await this.schoolRepository.insert(newSchool);
    }

    async updateSchool(id: number, name: string): Promise<void> {
        await this.schoolRepository.update(id, name);
    }

    async deleteSchool(id: number): Promise<void> {
        await this.schoolRepository.delete(id);
    }
}