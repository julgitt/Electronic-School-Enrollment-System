import { SchoolRepository } from "../repositories/schoolRepository";
import { ProfileRepository } from "../repositories/profileRepository";
import { School } from "../types/school";
import {SchoolModel} from "../models/schoolModel";

export class SchoolService {
    constructor(private schoolRepository: SchoolRepository,
                private profileRepository: ProfileRepository) {
        this.schoolRepository = schoolRepository;
        this.profileRepository = profileRepository;
    }

    async getAllSchoolsWithProfiles(): Promise<School[]> {
        let schools = await this.schoolRepository.getAll();
        for (let school of schools) {
            school.profiles = await this.profileRepository.getAllBySchool(school.id!);
        }
        return schools
    }

    async getSchoolWithProfiles(id: number): Promise<School | null> {
        let school = await this.schoolRepository.getById(id);
        if (school) {
            school.profiles = await this.profileRepository.getAllBySchool(school.id);
        }
        return school
    }

    async addSchool(name: string, ): Promise<void> {
        const newSchool: SchoolModel = {
            id: 0,
            name: name,
        }

        await this.schoolRepository.insert(newSchool);
    }
}