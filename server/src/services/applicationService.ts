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
import {EnrollmentService} from "./enrollmentService";
import {ValidationError} from "../errors/validationError";
import {Enrollment} from "../dto/enrollment";
import {ApplicationStatus} from "../dto/applicationStatus";

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
        const applications = await this.applicationRepository.getAllByCandidate(candidateId);

        return Promise.all(
            applications.map(async (app) => {
                const [enrollment, profile, school] = await Promise.all([
                    this.enrollmentService.getEnrollment(app.enrollmentId),
                    this.profileService.getProfile(app.profileId),
                    this.schoolService.getSchoolWithProfiles(app.profileId)
                ]);

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

    async updateApplicationStatus(id: number, status: string, t: ITask<any>) {
        return this.applicationRepository.updateStatus(id, status, t);
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
            await this.profileService.getProfile(submission.profileId);
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
        const groupedBySchool: ApplicationBySchool[] = [];
        for (const app of applications) {
            let schoolGroup = groupedBySchool.find(group =>
                group.school.id === app.school.id
            );
            if (!schoolGroup) {
                schoolGroup = {
                    school: app.school,
                    profiles: [],
                };
                groupedBySchool.push(schoolGroup);
            }

            schoolGroup.profiles.push({
                profileId: app.profile.id,
                priority: app.priority,
            });
        }
        return groupedBySchool;
    };
}