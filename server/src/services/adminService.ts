import {SchoolService} from "./schoolService";
import {ApplicationService} from "./applicationService";
import {ProfileService} from "./profileService";
import {CandidateService} from "./candidateService";
import {Profile} from "../dto/profile";
import {Application} from "../dto/application";
import {SchoolWithProfiles} from "../dto/schoolWithProfiles";
import {Grade} from "../dto/grade";
import {ITask} from "pg-promise";

export class AdminService {
    constructor(
        private schoolService: SchoolService,
        private candidateService: CandidateService,
        private profileService: ProfileService,
        private applicationService: ApplicationService,
        private readonly tx: (callback: (t: ITask<any>) => Promise<void>) => Promise<void>
    ) {}

    async enroll(): Promise<void> {
        const schools: SchoolWithProfiles[] = await this.schoolService.getAllSchoolsWithProfiles();
        const profiles: Profile[] = schools.flatMap(school => school.profiles);

        const maxPriority: number = await this.applicationService.getMaxPriority();
        const gradesByCandidate = await this.candidateService.getAllWithGrades();

        await this.tx(async t => {
            for (let priority = 1; priority < maxPriority; priority++) {
                for (let profile of profiles) {
                    await this.processEnrollmentForProfile(profile, priority, gradesByCandidate, t);
                }
            }
        });
    }

    private async processEnrollmentForProfile(
        profile: Profile,
        priority: number,
        gradesByCandidate: Map<number, Grade[]>,
        t: ITask<any>
    ): Promise<void> {
        const capacity: number = profile.capacity;
        let enrolledNumber: number = await this.applicationService.getAllEnrolledByProfile(profile.id);

        const criteria = await this.profileService.getProfileCriteria(profile.id);
        if (!criteria) throw new Error(`Criteria not found for profile ID ${profile.id}`);

        let enrolledCandidateIds: number[] = [];

        let applications: Application[]  = (await this.applicationService.getAllPendingApplicationsByProfileAndPriority(profile.id, priority))
            .sort((a, b) =>
                ProfileService.calculatePoints(criteria, gradesByCandidate.get(b.candidateId)!)
                - ProfileService.calculatePoints(criteria, gradesByCandidate.get(a.candidateId)!)
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
                        ? 'accepted'
                        : 'rejected',
                    t
                );
            }
        }

        for (let applicationId of rejected) {
            await this.applicationService.updateApplicationStatus(applicationId, 'rejected', t);
        }

    }
}