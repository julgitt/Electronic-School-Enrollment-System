import { ITask } from "pg-promise";

import { Application } from '../models/applicationModel';
import { ApplicationRepository } from '../repositories/applicationRepository';
import { SchoolRepository } from '../repositories/schoolRepository';
import { ResourceNotFoundError } from "../errors/resourceNotFoundError";
import {DataConflictError} from "../errors/dataConflictError";

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
        if (await this.getAllApplications(userId)) {
            throw new DataConflictError('Application already  exists');
        }
        for (const schoolId of schools) {
            const school = await this.schoolRepository.getById(schoolId);
            if (!school) {
                throw new ResourceNotFoundError('School ID is not recognized.');
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

    async updateApplication(firstName: string, lastName: string, pesel: string, schools: number[], userId: number): Promise<void> {
        let applications = await this.getAllApplications(userId);
        if (!applications) {
            throw new ResourceNotFoundError('Application not found.');
        }

        for (const schoolId of schools) {
            const school = await this.schoolRepository.getById(schoolId);
            if (!school) {
                throw new ResourceNotFoundError('School ID is not recognized.');
            }
        }

        await this.tx(async t => {
            for (const application of applications) {
                await this.applicationRepository.delete(application.id!, t);
            }
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