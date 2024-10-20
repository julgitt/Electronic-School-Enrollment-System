import { School } from '../models/schoolModel';
import defaultSchoolRepository, { SchoolRepository } from "../repositories/schoolRepository";

export class SchoolService {
    private schoolRepository: SchoolRepository;

    constructor(schoolRepository?: SchoolRepository) {
        if (schoolRepository != null) {
            this.schoolRepository = schoolRepository;
        } else {
            this.schoolRepository = defaultSchoolRepository;
        }
    }

    async getAllSchools(): Promise<School[]> {
        return this.schoolRepository.getAll();
    }

    async addSchool(name: string, enrollmentLimit: number): Promise<void> {
        const newSchool: Omit<School, 'id'> = {
            name: name,
            enrollmentLimit: enrollmentLimit,
        }

        await this.schoolRepository.insert(newSchool);
    }
}

export default new SchoolService()
