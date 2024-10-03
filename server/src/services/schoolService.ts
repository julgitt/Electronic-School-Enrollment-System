import { SchoolRepository } from '../repositories/schoolRepository';
import { School } from '../models/schoolModel';

export class SchoolService {
    private schoolRepository: SchoolRepository;

    constructor(schoolRepository: SchoolRepository) {
        this.schoolRepository = schoolRepository;
    }

    async getAllSchools(): Promise<School[]> {
        return this.schoolRepository.getAllSchools();
    }

    async addSchool(name: string, enrollmentLimit: number): Promise<School> {
        const newSchool: Omit<School, 'id'> = {
            name: name,
            enrollmentLimit: enrollmentLimit,
        }

        return this.schoolRepository.insertSchool(newSchool);
    }
}
