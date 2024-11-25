import { ITask } from "pg-promise";

import { ApplicationRepository } from '../repositories/applicationRepository';
import { ProfileRepository } from '../repositories/profileRepository';
import { ResourceNotFoundError } from "../errors/resourceNotFoundError";
import { DataConflictError } from "../errors/dataConflictError";
import {ApplicationSubmission} from "../types/applicationSubmission";
import {ApplicationSubmissionsBySchool} from "../types/applicationSubmissionsBySchool";
import {SchoolService} from "./schoolService";
import {Application} from "../types/application";
import {ApplicationModel} from "../models/applicationModel";

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
        const applications: ApplicationModel[] = await this.applicationRepository.getAllByCandidate(candidateId);

        const userFriendlyApplications: Application[] = [];

        for (const app of applications) {
            const profile = await this.profileRepository.getById(app.profileId);
            if (profile == null) throw new ResourceNotFoundError('Profile ID is not recognized.');
            const school = await this.schoolService.getByIdWithProfiles(profile.schoolId);
            if (school == null) throw new ResourceNotFoundError('School ID is not recognized.');

            const newApplication: Application = {
                id: app.id!,
                school: school,
                profile: profile,
                priority: app.priority,
                stage: app.stage,
                status: app.status,
                submittedAt: app.submittedAt || Date.now(),
                updatedAt: Date.now()
            };

            userFriendlyApplications.push(newApplication);
        }
        return userFriendlyApplications;
    }

    async getAllApplicationSubmissions(candidateId: number): Promise<ApplicationSubmissionsBySchool[]> {
        // TODO: musi  być z obecnej tury!
        const applications = await this.getAllApplications(candidateId);
        return this.groupApplicationsBySchool(applications);
    }

    async addApplication(submissions: ApplicationSubmission[], candidateId: number): Promise<void> {
        const applications: ApplicationModel[] = await this.applicationRepository.getAllByCandidate(candidateId);
        if (applications.length !== 0) {
            throw new DataConflictError('Application already exists');
        }
        for (const submission of submissions) {
            const profile = await this.profileRepository.getById(submission.profileId);
            if (profile == null) {
                throw new ResourceNotFoundError('Profile ID is not recognized.');
            }
        }

        await this.tx(async t => {
            for (const submission of submissions) {
                const newApplication: ApplicationModel = {
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
        let applications = await this.applicationRepository.getAllByCandidate(candidateId);
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
                const newApplication: ApplicationModel = {
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
            if (!groupedBySchool.has(app.school.id)) {
                groupedBySchool.set(app.school.id, {
                    school: app.school,
                    profiles: [],
                });
            }

            groupedBySchool.get(app.school.id)!.profiles.push({
                profileId: app.profile.id,
                priority: app.priority,
            });
        }

        return Array.from(groupedBySchool.values());
    };
}