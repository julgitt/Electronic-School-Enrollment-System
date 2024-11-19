import { ITask } from "pg-promise";

import { Application } from '../models/applicationModel';
import { ApplicationRepository } from '../repositories/applicationRepository';
import { ProfileRepository } from '../repositories/profileRepository';
import { ResourceNotFoundError } from "../errors/resourceNotFoundError";
import { DataConflictError } from "../errors/dataConflictError";
import {ApplicationSubmission} from "../types/applicationSubmission";
import {ApplicationSubmissionsBySchool} from "../types/applicationSubmissionsBySchool";
import {SchoolService} from "./schoolService";

export class ApplicationService {
    constructor(
        private applicationRepository: ApplicationRepository,
        private profileRepository: ProfileRepository,
        private schoolService: SchoolService,
        private readonly tx: (callback: (t: ITask<any>) => Promise<void>) => Promise<void>
    ) {
        this.applicationRepository = applicationRepository;
        this.profileRepository = profileRepository;
        this.schoolService = schoolService;
        this.tx = tx;
    }

    async getAllApplications(candidateId: number): Promise<Application[]> {
        return this.applicationRepository.getAllByCandidate(candidateId);
    }

    async getAllApplicationSubmissions(candidateId: number): Promise<ApplicationSubmissionsBySchool[]> {
        // TODO: musi  być z obecnej tury!
        const applications = await this.applicationRepository.getAllByCandidate(candidateId);
        return this.groupApplicationsBySchool(applications);
    }

    async addApplication(submissions: ApplicationSubmission[], candidateId: number): Promise<void> {
        const applications: Application[] = await this.getAllApplications(candidateId);
        if (applications.length !== 0) {
            throw new DataConflictError('Application already  exists');
        }
        for (const submission of submissions) {
            const profile = await this.profileRepository.getById(submission.profileId);
            if (profile == null) {
                throw new ResourceNotFoundError('Profile ID is not recognized.');
            }
        }

        await this.tx(async t => {
            for (const submission of submissions) {
                const newApplication: Application = {
                    candidateId: candidateId,
                    profileId: submission.profileId,
                    priority: submission.priority,
                    stage: 1,
                    status: 'pending',
                };

                await this.applicationRepository.insert(newApplication, t);
            }
        });
    }

    async updateApplication(submissions: ApplicationSubmission[], candidateId: number): Promise<void> {
        let applications = await this.getAllApplications(candidateId);
        if (applications.length === 0) {
            throw new ResourceNotFoundError('Application not found.');
        }
        // TODO: Add personal form data insert

        for (const submission of submissions) {
            const profile = await this.profileRepository.getById(submission.profileId);
            if (profile == null) {
                throw new ResourceNotFoundError('Profile ID is not recognized.');
            }
        }

        await this.tx(async t => {
            for (const application of applications) {
                await this.applicationRepository.delete(application.profileId, application.candidateId, t);
            }
            for (const submission of submissions) {
                const newApplication: Application = {
                    candidateId: candidateId,
                    profileId: submission.profileId,
                    priority: submission.priority,
                    stage: 1,
                    status: 'pending',
                };

                await this.applicationRepository.insert(newApplication, t);
            }
        });
    }

    private async groupApplicationsBySchool(applications: Application[]){
        const groupedBySchool = new Map<number, ApplicationSubmissionsBySchool>();

        for (const app of applications) {
            const profile = await this.profileRepository.getById(app.profileId);
            if  (profile == null) throw new ResourceNotFoundError('Profile ID is not recognized.');
            const school = await this.schoolService.getByIdWithProfiles(profile.schoolId);
            if  (school  == null) throw new ResourceNotFoundError('School ID is not recognized.');

            if (!groupedBySchool.has(school.id)) {
                groupedBySchool.set(school.id, {
                    school: school,
                    profiles: [],
                });
            }

            groupedBySchool.get(school.id)!.profiles.push({
                profileId: app.profileId,
                priority: app.priority,
            });
        }

        return Array.from(groupedBySchool.values());
    };
}