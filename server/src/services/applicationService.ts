import defaultApplicationRepository, { ApplicationRepository } from '../repositories/applicationRepository';
import defaultSchoolRepository, { SchoolRepository } from '../repositories/schoolRepository';
import { Application } from '../models/applicationModel';
import { db } from "../db";
import { ValidationError } from "../errors/validationError";

export class ApplicationService {
    private applicationRepository: ApplicationRepository;
    private schoolRepository: SchoolRepository;

    constructor(applicationRepository?: ApplicationRepository, schoolRepository?: SchoolRepository) {
        if (applicationRepository != null && schoolRepository != null) {
            this.applicationRepository = applicationRepository;
            this.schoolRepository = schoolRepository;
        } else {
            this.applicationRepository = defaultApplicationRepository;
            this.schoolRepository = defaultSchoolRepository;
        }

    }

    async addApplication(firstName: string, lastName: string, pesel: string, schools: number[], userId: number): Promise<void> {
        // TODO: Check if application already exists?
        for (const schoolId of schools) {
            const school = await this.schoolRepository.getById(schoolId);
            if (!school) {
                throw new ValidationError('School ID is not recognized.', 400);
            }
        }

        await db.tx(async t => {
                for (const schoolId of schools) {
                    const newApplication: Application = {
                        userId: userId,
                        schoolId: schoolId,
                        firstName: firstName,
                        lastName: lastName,
                        pesel: pesel,
                        stage: 1,
                        status: 'pending',
                    };

                    await this.applicationRepository.insert(newApplication, t);
                }
        });
    }
}

export default new ApplicationService()