import {ITask} from "pg-promise";

import {ApplicationRepository} from '../repositories/applicationRepository';
import {ResourceNotFoundError} from "../errors/resourceNotFoundError";
import {DataConflictError} from "../errors/dataConflictError";
import {SchoolService} from "./schoolService";
import {ProfileService} from "./profileService";
import {ApplicationWithProfiles} from "../dto/applicationWithProfiles";
import {ApplicationBySchool} from "../dto/applicationBySchool";
import {ApplicationRequest} from "../dto/applicationRequest";
import {ApplicationEntity} from "../models/applicationEntity";
import {Application} from "../dto/application";
import {Profile} from "../dto/profile";
import {SchoolWithProfiles} from "../dto/schoolWithProfiles";

export class ApplicationService {
    constructor(
        private applicationRepository: ApplicationRepository,
        private profileService: ProfileService,
        private schoolService: SchoolService,
        private readonly tx: (callback: (t: ITask<any>) => Promise<void>) => Promise<void>
    ) {}

    async getAllApplications(candidateId: number): Promise<ApplicationWithProfiles[]> {
        const applications: Application[] = await this.applicationRepository.getAllByCandidate(candidateId);

        const applicationsWithProfiles: ApplicationWithProfiles[] = [];

        for (const app of applications) {
            const profile: Profile | null = await this.profileService.getProfile(app.profileId);
            if (profile == null) throw new ResourceNotFoundError('Profile ID is not recognized.');
            const school: SchoolWithProfiles | null = await this.schoolService.getSchoolWithProfiles(profile.schoolId);
            if (school == null) throw new ResourceNotFoundError('School ID is not recognized.');

            const newApplication: ApplicationWithProfiles = {
                id: app.id,
                school: school,
                profile: profile,
                priority: app.priority,
                round: app.round,
                status: app.status,
                submittedAt: app.submittedAt,
                updatedAt: app.updatedAt
            };

            applicationsWithProfiles.push(newApplication);
        }
        return applicationsWithProfiles;
    }

    async getAllPendingApplicationsByProfileAndPriority(profileId: number, priority: number): Promise<Application[]> {
        return this.applicationRepository.getAllPendingByProfileAndPriority(profileId, priority);
    }

    async getAllEnrolledByProfile(profileId: number): Promise<number> {
        return this.applicationRepository.getEnrolledByProfile(profileId)
    }

    async getMaxPriority(): Promise<number> {
        return this.applicationRepository.getMaxPriority();
    }

    async getAllApplicationSubmissions(candidateId: number): Promise<ApplicationBySchool[]> {
        // TODO: musi  być z obecnej tury!
        const applications: ApplicationWithProfiles[] = await this.getAllApplications(candidateId);
        return this.groupApplicationsBySchool(applications);
    }

    async addApplication(submissions: ApplicationRequest[], candidateId: number): Promise<void> {
        const applications: Application[] = await this.applicationRepository.getAllByCandidate(candidateId);
        if (applications.length !== 0) {
            throw new DataConflictError('ApplicationWithProfiles already exists');
        }
        for (const submission of submissions) {
            const profile = await this.profileService.getProfile(submission.profileId);
            if (profile == null) {
                throw new ResourceNotFoundError('Profile ID is not recognized.');
            }
        }

        await this.tx(async t => {
            for (const submission of submissions) {
                const newApplication: ApplicationEntity = {
                    id: 0,
                    candidateId: candidateId,
                    profileId: submission.profileId,
                    priority: submission.priority,
                    round: 1,
                    status: 'pending',
                    submittedAt: new Date(),
                    updatedAt: new Date(),
                };

                await this.applicationRepository.insert(newApplication, t);
            }
        });
    }

    async updateApplicationStatus(id: number, status: string) {
        this.applicationRepository.updateStatus(id, status);

    }

    async updateApplication(submissions: ApplicationRequest[], candidateId: number): Promise<void> {
        let applications: ApplicationEntity[] = await this.applicationRepository.getAllByCandidate(candidateId);
        if (applications.length === 0) {
            throw new ResourceNotFoundError('ApplicationWithProfiles not found.');
        }
        // TODO: Add personal form data insert

        for (const submission of submissions) {
            const profile = await this.profileService.getProfile(submission.profileId);
            if (profile == null) {
                throw new ResourceNotFoundError('Profile ID is not recognized.');
            }
        }

        await this.tx(async t => {
            for (const application of applications) {
                await this.applicationRepository.delete(application.profileId, application.candidateId, t);
            }
            for (const submission of submissions) {
                const newApplication: ApplicationEntity = {
                    id: 0,
                    candidateId: candidateId,
                    profileId: submission.profileId,
                    priority: submission.priority,
                    round: 1,
                    status: 'pending',
                    submittedAt: new Date(),
                    updatedAt: new Date(),
                };

                await this.applicationRepository.insert(newApplication, t);
            }
        });
    }

    private async groupApplicationsBySchool(applications: ApplicationWithProfiles[]) {
        const groupedBySchool = new Map<number, ApplicationBySchool>();

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