import schoolRepository from '../repositories/schoolRepository';
import { School } from '../models/schoolModel';

class SchoolService {
    async getAllSchools(): Promise<School[]> {
        return schoolRepository.getAll();
    }

    async addSchool(name: string, enrollmentLimit: number): Promise<void> {
        const newSchool: Omit<School, 'id'> = {
            name: name,
            enrollmentLimit: enrollmentLimit,
        }

        await schoolRepository.insert(newSchool);
    }
}

export default new SchoolService();