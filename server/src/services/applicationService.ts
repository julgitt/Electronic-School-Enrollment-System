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

    async getAllApplications(candidateId: number): Promise<Application[]> {
        return this.applicationRepository.getAllByCandidate(candidateId);
    }

    async addApplication(firstName: string, lastName: string, pesel: string, schools: number[], candidateId: number): Promise<void> {
        const applications: Application[] = await this.getAllApplications(candidateId);
        if (applications.length !== 0) {
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
                    candidateId: candidateId,
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

    async updateApplication(firstName: string, lastName: string, pesel: string, schools: number[], candidateId: number): Promise<void> {
        let applications = await this.getAllApplications(candidateId);
        if (applications.length === 0) {
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
                await this.applicationRepository.delete(application.schoolId, application.candidateId, t);
            }
            for (const schoolId of schools) {
                const newApplication: Application = {
                    candidateId: candidateId,
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