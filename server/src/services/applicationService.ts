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
import {EnrollmentService} from "./enrollmentService";
import {ValidationError} from "../errors/validationError";
import {Enrollment} from "../dto/enrollment";

export class ApplicationService {
    constructor(
        private applicationRepository: ApplicationRepository,
        private profileService: ProfileService,
        private enrollmentService: EnrollmentService,
        private schoolService: SchoolService,
        private readonly tx: (callback: (t: ITask<any>) => Promise<void>) => Promise<void>
    ) {}

    async getAllApplications(candidateId: number): Promise<ApplicationWithProfiles[]> {
        const applications: Application[] = await this.applicationRepository.getAllByCandidate(candidateId);

        const applicationsWithProfiles: ApplicationWithProfiles[] = [];

        for (const app of applications) {
            const enrollment: Enrollment | null = await this.enrollmentService.getEnrollmentById(app.enrollmentId);
            if (enrollment == null) throw new ResourceNotFoundError('Enrollment ID is not recognized.');
            const profile: Profile | null = await this.profileService.getProfile(app.profileId);
            if (profile == null) throw new ResourceNotFoundError('Profile ID is not recognized.');
            const school: SchoolWithProfiles | null = await this.schoolService.getSchoolWithProfiles(profile.schoolId);
            if (school == null) throw new ResourceNotFoundError('School ID is not recognized.');

            const newApplication: ApplicationWithProfiles = {
                id: app.id,
                school: school,
                profile: profile,
                priority: app.priority,
                round: enrollment.round,
                status: app.status,
                createdAt: app.createdAt,
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
        const applications: ApplicationWithProfiles[] = await this.getAllApplications(candidateId);
        return this.groupApplicationsBySchool(applications);
    }

    async addApplication(submissions: ApplicationRequest[], candidateId: number): Promise<void> {
        const enrollment: Enrollment | null = await this.enrollmentService.getCurrentEnrollment();
        if (!enrollment) throw new ValidationError('Application cannot be submitted outside the enrollment period.');

        const applications: Application[] = await this.applicationRepository.getAllByCandidateAndEnrollmentId(candidateId, enrollment.id);
        if (applications.length !== 0) throw new DataConflictError('Application already exists');

        for (const submission of submissions) {
            const profile = await this.profileService.getProfile(submission.profileId);
            if (profile == null) throw new ResourceNotFoundError('Profile ID is not recognized.');
        }

        await this.tx(async t => {
            for (const submission of submissions) {
                const newApplication: ApplicationEntity = {
                    id: 0,
                    candidateId: candidateId,
                    profileId: submission.profileId,
                    priority: submission.priority,
                    enrollmentId: enrollment.id,
                    status: 'pending',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                await this.applicationRepository.insert(newApplication, t);
            }
        });
    }

    async updateApplicationStatus(id: number, status: string, t: ITask<any>) {
        return this.applicationRepository.updateStatus(id, status, t);
    }

    async updateApplication(submissions: ApplicationRequest[], candidateId: number): Promise<void> {
        const enrollment: Enrollment | null = await this.enrollmentService.getCurrentEnrollment();
        if (!enrollment) throw new ValidationError('Application cannot be submitted outside the enrollment period.');

        const applications: ApplicationEntity[] = await this.applicationRepository.getAllByCandidateAndEnrollmentId(candidateId, enrollment.id);
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
                    enrollmentId: enrollment.id,
                    status: 'pending',
                    createdAt: new Date(),
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