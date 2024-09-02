// services/schoolService.ts

import { SchoolRepository } from '../repositories/schoolRepository';
import { School } from '../models/schoolModel';

export class SchoolService {
    private schoolRepository: SchoolRepository;

    constructor() {
        this.schoolRepository = new SchoolRepository();
    }

    async getAllSchools(): Promise<School[]> {
        return await this.schoolRepository.getAllSchools();
    }

    async addNewSchool(name: string, enrollmentLimit: number): Promise<School> {
        const newSchool: Omit<School, 'id'> = {
            name: name,
            enrollmentLimit: enrollmentLimit,
        }

        return this.schoolRepository.insertSchool(newSchool);
    }
}
