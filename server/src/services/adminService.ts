import {SchoolService} from "./schoolService";
import {ApplicationService} from "./applicationService";
import {ProfileService} from "./profileService";
import {CandidateService} from "./candidateService";
import {Profile} from "../dto/profile";
import {Application} from "../dto/application";
import {SchoolWithProfiles} from "../dto/schoolWithProfiles";
import {Grade} from "../dto/grade";
import {ITask} from "pg-promise";
import {ProfileCriteriaEntity, ProfileCriteriaType} from "../models/profileCriteriaEntity";
import {ApplicationStatus} from "../dto/applicationStatus";
import {ResourceNotFoundError} from "../errors/resourceNotFoundError";

export class AdminService {
    constructor(
        private candidateService: CandidateService,
        private profileService: ProfileService,
        private applicationService: ApplicationService,
        private readonly tx: (callback: (t: ITask<any>) => Promise<void>) => Promise<void>
    ) {
    }

    async enroll(): Promise<void> {
        const profiles: Profile[] = await this.profileService.getAllProfiles();
        const profilesCriteria: Map<number, ProfileCriteriaEntity[]> = await this.profileService.getAllProfilesCriteria();

        const maxPriority: number = await this.applicationService.getMaxPriority();
        const gradesByCandidate = await this.candidateService.getAllWithGrades();

        await this.tx(async t => {
            for (let priority = 1; priority < maxPriority; priority++) {
                for (let profile of profiles) {
                    const profileCriteria = profilesCriteria.get(profile.id);
                    if (!profileCriteria) throw new ResourceNotFoundError('Criteria not found');
                    await this.processEnrollmentForProfile(profile, profileCriteria, priority, gradesByCandidate, t);
                }
            }
        });
    }

    private async processEnrollmentForProfile(
        profile: Profile,
        criteria: ProfileCriteriaEntity[],
        priority: number,
        gradesByCandidate: Map<number, Grade[]>,
        t: ITask<any>
    ): Promise<void> {
        const capacity: number = profile.capacity;
        let enrolledNumber: number = await this.applicationService.getAllEnrolledByProfile(profile.id);
        let enrolledCandidateIds: number[] = [];

        let applications: Application[] = (await this.applicationService.getAllPendingApplicationsByProfileAndPriority(profile.id, priority))
            .sort((a, b) =>
                this.calculatePoints(criteria, gradesByCandidate.get(a.candidateId)!)
                - this.calculatePoints(criteria, gradesByCandidate.get(b.candidateId)!)
            );
        while (enrolledNumber < capacity && applications.length > 0) {
            enrolledCandidateIds.push(applications.pop()!.candidateId);
            enrolledNumber = enrolledNumber + 1;
        }

        const rejectedApplicationIds = applications.map(app => app.id);
        await this.updateApplicationStatuses(enrolledCandidateIds, rejectedApplicationIds, profile.id, t);
    }

    private async updateApplicationStatuses(enrolled: number[], rejected: number[], profileId: number, t: ITask<any>) {
        for (let candidateId of enrolled) {
            const applications = await this.applicationService.getAllApplications(candidateId);
            for (let application of applications) {
                await this.applicationService.updateApplicationStatus(
                    application.id,
                    (application.profile.id === profileId)
                        ? ApplicationStatus.Accepted
                        : ApplicationStatus.Rejected,
                    t
                );
            }
        }

        for (let applicationId of rejected) {
            await this.applicationService.updateApplicationStatus(applicationId, ApplicationStatus.Rejected, t);
        }

    }

    private calculatePoints(profileCriteria: ProfileCriteriaEntity[], grades: Grade[]) {
        const mandatorySubjects = profileCriteria.filter(s => s.type === ProfileCriteriaType.Mandatory);
        const alternativeSubjects = profileCriteria.filter(s => s.type === ProfileCriteriaType.Alternative);
        let points = 0;

        let alternativeGrades = []
        for (let grade of grades) {
            if (grade.type == "exam") {
                points += grade.grade;
            } else if (grade.subjectId in mandatorySubjects) {
                points += grade.grade;
            } else if (grade.subjectId in alternativeSubjects) {
                alternativeGrades.push(grade.grade);
            }
        }
        return points + alternativeGrades.sort().pop()!;
    }
}