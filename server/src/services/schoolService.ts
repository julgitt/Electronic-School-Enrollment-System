import { School } from '../models/schoolModel';
import defaultSchoolRepository, { SchoolRepository } from "../repositories/schoolRepository";

export class SchoolService {
    private _schoolRepository: SchoolRepository;

    public set schoolRepository(schoolRepository: SchoolRepository) {
        this._schoolRepository = schoolRepository;
    }

    constructor() {
        this._schoolRepository = defaultSchoolRepository;
    }

    async getAllSchools(): Promise<School[]> {
        return this._schoolRepository.getAll();
    }

    async addSchool(name: string, enrollmentLimit: number): Promise<void> {
        const newSchool: Omit<School, 'id'> = {
            name: name,
            enrollmentLimit: enrollmentLimit,
        }

        await this._schoolRepository.insert(newSchool);
    }
}

export default new SchoolService()
