import { School } from '../models/schoolModel';
import { SchoolRepository } from "../repositories/schoolRepository";
import {ProfileRepository} from "../repositories/profileRepository";

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

    async getByIdWithProfiles(id: number): Promise<School | null> {
        let school = await this.schoolRepository.getById(id);
        if (school) {
            school.profiles = await this.profileRepository.getAllBySchool(school.id);
        }
        return school
    }

    async addSchool(name: string, ): Promise<void> {
        const newSchool: School = {
            id: 0,
            name: name,
        }

        await this.schoolRepository.insert(newSchool);
    }
}