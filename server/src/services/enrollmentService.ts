import {SchoolService} from "./schoolService";
import {ApplicationService} from "./applicationService";
import {ProfileService} from "./profileService";
import {Profile} from "../models/profileModel";
import {Grade} from "../models/gradeModel";
import {CandidateService} from "./candidateService";

export class EnrollmentService {
    constructor(
        private schoolService: SchoolService,
        private candidateService: CandidateService,
        private profileService: ProfileService,
        private applicationService: ApplicationService,
    ){}

   /* async setEnrollmentStartDateForRound(round: number, date: Date): Promise<void> {

    }

    async setEnrollmentEndDateForRound(round: number, date: Date): Promise<void> {

    }*/

    async enroll(): Promise<void> {
        const schools = await this.schoolService.getAllSchoolsWithProfiles();
        for (const school of schools) {
            for (const profile of school.profiles) {
                await this.processEnrollmentForProfile(profile);
            }
        }
    }

    private async processEnrollmentForProfile(profile: Profile): Promise<void> {
        const capacity = profile.capacity;
        const criteria = await this.profileService.getProfileCriteria(profile.id);
        let enrolled: number[] = [];
        let priority = 1;

        const applications = await this.applicationService.getAllApplicationsByProfile(profile.id);
        const gradesByCandidate = await this.candidateService.getAllWithGrades();
        while  (priority <= 5 && enrolled.length < capacity ) {
            let applicationsWithPriority = applications
                    .filter(app => app.priority === priority)
                    .sort((a, b) =>
                        ProfileService.calculatePoints(criteria, gradesByCandidate.get(a.candidateId)!)
                        - ProfileService.calculatePoints(criteria, gradesByCandidate.get(b.candidateId)!)
                    );
            for (const application of applicationsWithPriority) {
                if (enrolled.length < capacity) {
                    enrolled.push(application.candidateId);
                } else {
                    break;
                }
            }
            priority++;
        }

        console.log(enrolled);
    }
}