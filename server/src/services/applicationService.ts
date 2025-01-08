import {ITask} from "pg-promise";

import {ApplicationRepository} from '../repositories/applicationRepository';
import {ResourceNotFoundError} from "../errors/resourceNotFoundError";
import {DataConflictError} from "../errors/dataConflictError";
import {SchoolService} from "./schoolService";
import {ProfileService} from "./profileService";
import {ApplicationWithProfiles} from "../dto/application/applicationWithProfiles";
import {ApplicationBySchool} from "../dto/application/applicationBySchool";
import {ApplicationRequest} from "../dto/application/applicationRequest";
import {ApplicationEntity} from "../models/applicationEntity";
import {Application} from "../dto/application/application";
import {EnrollmentService} from "./enrollmentService";
import {ValidationError} from "../errors/validationError";
import {Enrollment} from "../dto/enrollment";
import {ApplicationStatus} from "../dto/application/applicationStatus";
import {transactionFunction} from "../db";
import {SCHOOL_MAX} from "../../../adminConstants";

export class ApplicationService {
    private profileService!: ProfileService;

    constructor(
        private applicationRepository: ApplicationRepository,
        private enrollmentService: EnrollmentService,
        private schoolService: SchoolService,
        private readonly tx: transactionFunction
    ) {
    }

    setProfileService(profileService: ProfileService) {
        this.profileService = profileService;
    }

    async getAllApplications(candidateId: number): Promise<ApplicationWithProfiles[]> {
        const applications = await this.applicationRepository.getAllByCandidate(candidateId);

        return Promise.all(
            applications.map(async (app) => {
                const [enrollment, profile] = await Promise.all([
                    this.enrollmentService.getEnrollment(app.enrollmentId),
                    this.profileService.getProfile(app.profileId),
                ]);
                const school = await this.schoolService.getSchoolWithProfiles(profile.schoolId)

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

    async getAllPendingByProfile(profileId: number): Promise<Application[]> {
        return this.applicationRepository.getAllByProfileAndStatus(profileId, ApplicationStatus.Pending);
    }

    async getAllAcceptedByProfile(profileId: number): Promise<Application[]> {
        return this.applicationRepository.getAllByProfileAndStatus(profileId, ApplicationStatus.Accepted)
    }

    async getAllApplicationSubmissions(candidateId: number): Promise<ApplicationBySchool[]> {
        const applications: ApplicationWithProfiles[] = await this.getAllApplications(candidateId);
        return this.groupApplicationsBySchool(applications);
    }

    async updateApplicationStatus(id: number, status: string, t: ITask<any>) {
        return this.applicationRepository.updateStatus(id, status, t);
    }

    async addApplication(submissions: ApplicationRequest[], candidateId: number): Promise<void> {
        const enrollment: Enrollment | null = await this.enrollmentService.getCurrentEnrollment();
        if (!enrollment) throw new ValidationError('Nie można złożyć aplikacji poza okresem naboru.');

        const existingApplications: Application[] = await this.applicationRepository.getAllByCandidateAndEnrollmentId(candidateId, enrollment.id);
        if (existingApplications.length > 0) throw new DataConflictError('Aplikacja już istnieje.');

        await this.validateProfiles(submissions);
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
        if (!enrollment) throw new ValidationError('Nie można złożyć aplikacji poza okresem naboru.');

        const applications: Application[] = await this.applicationRepository.getAllByCandidateAndEnrollmentId(candidateId, enrollment.id);
        if (applications.length === 0) throw new ResourceNotFoundError('Nie odnaleziono aplikacji.');

        await this.validateProfiles(submissions);
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

    async rejectApplication(id: number, profileId: number): Promise<void> {
        const application = await this.applicationRepository.getById(id);
        if (!application || profileId != application.profileId) throw new ResourceNotFoundError("Nie znaleziono aplikacji do usunięcia.");
        await this.applicationRepository.rejectById(id);
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

    private async validateProfiles(submissions: ApplicationRequest[]) {
        const schoolIds = new Set<number>();

        for (const submission of submissions) {
            const profile = await this.profileService.getProfile(submission.profileId);
            if (profile && profile.schoolId) {
                schoolIds.add(profile.schoolId);
            }
        }

        if (schoolIds.size > SCHOOL_MAX) throw new ValidationError("Przekroczono dopuszczalną liczbę szkół");
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