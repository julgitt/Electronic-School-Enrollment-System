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
    ) {
    }

    async getAllApplications(candidateId: number): Promise<ApplicationWithProfiles[]> {
        const applications: Application[] = await this.applicationRepository.getAllByCandidate(candidateId);

        return Promise.all(
            applications.map(async (app) => {
                const [enrollment, profile, school] = await Promise.all([
                    this.enrollmentService.getEnrollmentById(app.enrollmentId),
                    this.profileService.getProfile(app.profileId),
                    app.profileId
                        ? this.schoolService.getSchoolWithProfiles(app.profileId)
                        : null,
                ]);

                if (!enrollment) throw new ResourceNotFoundError('Enrollment not found.');
                if (!profile) throw new ResourceNotFoundError('Profile not found.');
                if (!school) throw new ResourceNotFoundError('School not found.');

                return {
                    id: app.id,
                    school: school,
                    profile: profile,
                    priority: app.priority,
                    round: enrollment.round,
                    status: app.status,
                    createdAt: app.createdAt,
                    updatedAt: app.updatedAt
                };
            })
        )
    }

    async getAllPendingApplicationsByProfileAndPriority(profileId: number, priority: number): Promise<Application[]> {
        return this.applicationRepository.getAllPendingByProfileAndPriority(profileId, priority);
    }

    async getAllApplicationSubmissions(candidateId: number): Promise<ApplicationBySchool[]> {
        const applications: ApplicationWithProfiles[] = await this.getAllApplications(candidateId);
        return this.groupApplicationsBySchool(applications);
    }

    async getAllEnrolledByProfile(profileId: number): Promise<number> {
        return this.applicationRepository.getEnrolledByProfile(profileId)
    }

    async getMaxPriority(): Promise<number> {
        return this.applicationRepository.getMaxPriority();
    }

    async addApplication(submissions: ApplicationRequest[], candidateId: number): Promise<void> {
        const enrollment: Enrollment | null = await this.enrollmentService.getCurrentEnrollment();
        if (!enrollment) throw new ValidationError('Outside the enrollment period.');

        const existingApplications: Application[] = await this.applicationRepository.getAllByCandidateAndEnrollmentId(candidateId, enrollment.id);
        if (existingApplications.length > 0) throw new DataConflictError('Application already exists');

        await this.validateProfilesExist(submissions);
        this.assignPriorities(submissions);

        await this.tx(async t => {
            for (const submission of submissions) {
                const newApplication = this.createApplicationEntity(submission, candidateId, enrollment.id);
                await this.applicationRepository.insert(newApplication, t);
            }
        });
    }

    async updateApplicationStatus(id: number, status: string, t: ITask<any>) {
        return this.applicationRepository.updateStatus(id, status, t);
    }

    async updateApplication(submissions: ApplicationRequest[], candidateId: number): Promise<void> {
        const enrollment: Enrollment | null = await this.enrollmentService.getCurrentEnrollment();
        if (!enrollment) throw new ValidationError('Outside the enrollment period.');

        const applications: Application[] = await this.applicationRepository.getAllByCandidateAndEnrollmentId(candidateId, enrollment.id);
        if (applications.length === 0) throw new ResourceNotFoundError('Applications not found.');

        await this.validateProfilesExist(submissions);
        this.assignPriorities(submissions);

        await this.tx(async t => {
            for (const application of applications) {
                await this.applicationRepository.delete(application.profileId, application.candidateId, t);
            }
            for (const submission of submissions) {
                const newApplication = this.createApplicationEntity(submission, candidateId, enrollment.id);
                await this.applicationRepository.insert(newApplication, t);
            }
        });
    }

    private createApplicationEntity(submission: ApplicationRequest, candidateId: number, enrollmentId: number): ApplicationEntity {
        return {
            id: 0,
            candidateId,
            profileId: submission.profileId,
            priority: submission.priority,
            enrollmentId,
            status: ApplicationStatus.Pending,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }

    private async validateProfilesExist(submissions: ApplicationRequest[]) {
        for (const submission of submissions) {
            const profile = await this.profileService.getProfile(submission.profileId);
            if (profile == null) throw new ResourceNotFoundError('Profile ID is not recognized.');
        }
    }

    private assignPriorities(submissions: ApplicationRequest[]) {
        submissions = submissions.sort(
            (a, b) => a.priority - b.priority
        );

        submissions.forEach((item, index) => {
            item.priority = index + 1;
        });
    }

    private groupApplicationsBySchool(applications: ApplicationWithProfiles[]) {
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