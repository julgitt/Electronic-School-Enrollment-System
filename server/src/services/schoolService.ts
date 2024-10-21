import { School } from '../models/schoolModel';
import { SchoolRepository } from "../repositories/schoolRepository";

export class SchoolService {
    constructor(private schoolRepository: SchoolRepository) {
        this.schoolRepository = schoolRepository;
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