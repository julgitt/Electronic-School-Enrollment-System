import {SchoolService} from "./schoolService";
import {ApplicationService} from "./applicationService";
import {ProfileService} from "./profileService";
import {CandidateService} from "./candidateService";
import {Profile} from "../dto/profile";
import {Application} from "../dto/application";
import {SchoolWithProfiles} from "../dto/schoolWithProfiles";

export class AdminService {
    constructor(
        private schoolService: SchoolService,
        private candidateService: CandidateService,
        private profileService: ProfileService,
        private applicationService: ApplicationService,
    ) {}

    async enroll(): Promise<void> {
        const schools: SchoolWithProfiles[] = await this.schoolService.getAllSchoolsWithProfiles();
        const maxPriority = await this.applicationService.getMaxPriority()

        for (let priority = 1; priority < maxPriority; priority++) {
            for (const school of schools) {
                for (const profile of school.profiles) {
                    await this.processEnrollmentForProfile(profile, priority);
                }
            }
        }
    }

    private async processEnrollmentForProfile(profile: Profile, priority: number): Promise<void> {
        const capacity: number = profile.capacity;
        let enrolledNumber: number = await this.applicationService.getAllEnrolledByProfile(profile.id);

        const criteria = await this.profileService.getProfileCriteria(profile.id);
        let enrolledCandidateIds: number[] = [];

        const gradesByCandidate = await this.candidateService.getAllWithGrades();
        let applications: Application[]  = (await this.applicationService.getAllPendingApplicationsByProfileAndPriority(profile.id, priority))
            .sort((a, b) =>
                ProfileService.calculatePoints(criteria, gradesByCandidate.get(a.candidateId)!)
                - ProfileService.calculatePoints(criteria, gradesByCandidate.get(b.candidateId)!)
            );
        while (enrolledNumber < capacity && applications.length > 0) {
            enrolledCandidateIds.push(applications.pop()!.candidateId);
            enrolledNumber = enrolledNumber + 1;
        }

        const rejectedApplicationIds = applications.map(app => app.id);
        await this.updateApplicationStatuses(enrolledCandidateIds, rejectedApplicationIds, profile.id);
    }

    private async updateApplicationStatuses(enrolled: number[], rejected: number[], profileId: number) {
        for (let candidateId of enrolled) {
            const applications = await this.applicationService.getAllApplications(candidateId);
            for (let application of applications) {
                await this.applicationService.updateApplicationStatus(
                    application.id,
                    (application.profile.id === profileId)
                        ? 'accepted'
                        : 'rejected');
            }
        }

        for (let applicationId of rejected) {
            await this.applicationService.updateApplicationStatus(applicationId, 'rejected');
        }

    }
}