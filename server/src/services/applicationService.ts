import { ITask } from "pg-promise";

import { ValidationError } from "../errors/validationError";

import { Application } from '../models/applicationModel';
import { ApplicationRepository } from '../repositories/applicationRepository';
import { SchoolRepository } from '../repositories/schoolRepository';

export class ApplicationService {
    constructor(
        private applicationRepository: ApplicationRepository,
        private schoolRepository: SchoolRepository,
        private readonly tx: (callback: (t: ITask<any>) => Promise<void>) => Promise<void>
    ) {
        this.applicationRepository = applicationRepository;
        this.schoolRepository = schoolRepository;
        this.tx = tx;
    }

    async getAllApplications(userId: number): Promise<Application[] | null> {
        return this.applicationRepository.getAllByUser(userId);
    }

    async addApplication(firstName: string, lastName: string, pesel: string, schools: number[], userId: number): Promise<void> {
        // TODO: Check if application already exists?
        for (const schoolId of schools) {
            const school = await this.schoolRepository.getById(schoolId);
            if (!school) {
                throw new ValidationError('School ID is not recognized.', 400);
            }
        }

        await this.tx(async t => {
            for (const schoolId of schools) {
                const newApplication: Omit<Application, 'schoolName'> = {
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