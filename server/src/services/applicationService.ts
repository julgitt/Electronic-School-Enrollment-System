import { ITask } from "pg-promise";

import { Application } from '../models/applicationModel';
import { ApplicationRepository } from '../repositories/applicationRepository';
import { ProfileRepository } from '../repositories/profileRepository';
import { ResourceNotFoundError } from "../errors/resourceNotFoundError";
import { DataConflictError } from "../errors/dataConflictError";

export class ApplicationService {
    constructor(
        private applicationRepository: ApplicationRepository,
        private profileRepository: ProfileRepository,
        private readonly tx: (callback: (t: ITask<any>) => Promise<void>) => Promise<void>
    ) {
        this.applicationRepository = applicationRepository;
        this.profileRepository = profileRepository;
        this.tx = tx;
    }

    async getAllApplications(candidateId: number): Promise<Application[]> {
        return this.applicationRepository.getAllByCandidate(candidateId);
    }

    async addApplication(selections: {id: number, priority: number}[], candidateId: number): Promise<void> {
        const applications: Application[] = await this.getAllApplications(candidateId);
        if (applications.length !== 0) {
            throw new DataConflictError('Application already  exists');
        }
        for (const selection of selections) {
            const profile = await this.profileRepository.getById(selection.id);
            if (profile == null) {
                throw new ResourceNotFoundError('Profile ID is not recognized.');
            }
        }

        await this.tx(async t => {
            for (const selection of selections) {
                const newApplication: Application = {
                    candidateId: candidateId,
                    profileId: selection.id,
                    priority: selection.priority,
                    stage: 1,
                    status: 'pending',
                };

                await this.applicationRepository.insert(newApplication, t);
            }
        });
    }

    async updateApplication(selections: {id: number, priority: number}[], candidateId: number): Promise<void> {
        let applications = await this.getAllApplications(candidateId);
        if (applications.length === 0) {
            throw new ResourceNotFoundError('Application not found.');
        }
        // TODO: Add personal form data insert

        for (const selection of selections) {
            const profile = await this.profileRepository.getById(selection.id);
            if (profile == null) {
                throw new ResourceNotFoundError('Profile ID is not recognized.');
            }
        }

        await this.tx(async t => {
            for (const application of applications) {
                await this.applicationRepository.delete(application.profileId, application.candidateId, t);
            }
            for (const selection of selections) {
                const newApplication: Application = {
                    candidateId: candidateId,
                    profileId: selection.id,
                    priority: selection.priority,
                    stage: 1,
                    status: 'pending',
                };

                await this.applicationRepository.insert(newApplication, t);
            }
        });
    }
}