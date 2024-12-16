import {ApplicationService} from "./applicationService";
import {ProfileService} from "./profileService";
import {CandidateService} from "./candidateService";
import {Profile} from "../dto/profile";
import {Application} from "../dto/application/application";
import {Grade} from "../dto/grade/grade";
import {ITask} from "pg-promise";
import {ProfileCriteriaEntity, ProfileCriteriaType} from "../models/profileCriteriaEntity";
import {ApplicationStatus} from "../dto/application/applicationStatus";
import {ResourceNotFoundError} from "../errors/resourceNotFoundError";
import {CriteriaByProfiles, ProfileCriteria} from "../dto/criteriaByProfile";
import {GradeByCandidate} from "../dto/grade/gradesByCandidate";
import {ApplicationRequest} from "../dto/application/applicationRequest";


type EnrollmentSlots = { accepted: Application[], reserve: Application[] };

export class AdminService {
    constructor(
        private candidateService: CandidateService,
        private profileService: ProfileService,
        private applicationService: ApplicationService,
        private readonly tx: (callback: (t: ITask<any>) => Promise<void>) => Promise<void>
    ) {
    }

    async processProfileEnrollments(): Promise<void> {
        const profiles: Profile[] = await this.profileService.getAllProfiles();
        const sortedCandidateLists = await this.createSortedCandidateListsByProfile(profiles);
        const finalEnrollmentLists = await this.finalizeEnrollmentProcess(sortedCandidateLists);

        await this.tx(async t => {
            for (const profile of profiles) {
                const enrollment = finalEnrollmentLists.get(profile.id);
                if (enrollment)
                    await this.updateApplicationStatuses(enrollment.accepted, profile.id, t);
            }
        });
    }

    public calculatePoints(profileCriteria: ProfileCriteriaEntity[], grades: Grade[]) {
        const mandatorySubjects = profileCriteria.filter(s => s.type === ProfileCriteriaType.Mandatory);
        const alternativeSubjects = profileCriteria.filter(s => s.type === ProfileCriteriaType.Alternative);
        let points = 0;

        let alternativeGrades = []
        for (let grade of grades) {
            if (grade.type == "exam") {
                points += grade.grade * 0.2;
            } else if (mandatorySubjects.some(s => s.id == grade.subjectId)) {
                points += grade.grade;
            } else if (alternativeSubjects.some(s => s.id == grade.subjectId)) {
                alternativeGrades.push(grade.grade);
            }
        }
        if (alternativeGrades.length > 0) {
            points += Math.max(...alternativeGrades);
        }
        return points;
    }

    private async createSortedCandidateListsByProfile(profiles: Profile[]) {
        const profilesCriteria: CriteriaByProfiles = await this.profileService.getAllProfilesCriteria();
        const gradesByCandidate: GradeByCandidate = await this.candidateService.getGradesByCandidates();
        const sortedCandidateLists = new Map<number, EnrollmentSlots>();

        for (const profile of profiles) {
            const profileCriteria = profilesCriteria.get(profile.id);
            if (!profileCriteria) throw new ResourceNotFoundError('Nie znaleziono kryteriów dla profilu.');

            const acceptedCount: number = await this.applicationService.getAcceptedCountByProfile(profile.id);
            const capacity: number = profile.capacity - acceptedCount;
            const applications = await this.createSortedCandidateListForProfile(profile, profileCriteria, gradesByCandidate);

            const accepted = applications.slice(0, capacity);
            const reserve = applications.slice(capacity);
            sortedCandidateLists.set(profile.id, {accepted, reserve});
        }

        return sortedCandidateLists;
    }

    private async createSortedCandidateListForProfile(profile: Profile, criteria: ProfileCriteria[], gradesByCandidate: Map<number, Grade[]>) {
        const applications = await this.applicationService.getAllPendingApplicationsByProfile(profile.id);
        return applications.sort((a, b) =>
            this.calculatePoints(criteria, gradesByCandidate.get(b.candidateId)!) -
            this.calculatePoints(criteria, gradesByCandidate.get(a.candidateId)!)
        );
    }

    private async finalizeEnrollmentProcess(sortedCandidates: Map<number, EnrollmentSlots>) {
        const candidateApplications = this.mapApplicationsByCandidate(sortedCandidates)
        let backtrack = true;

        while (backtrack) {
            backtrack = false;
            for (const [, {accepted}] of sortedCandidates) {
                for (const application of accepted) {
                    const candidateId = application.candidateId;
                    const applications = candidateApplications.get(candidateId);

                    if (!applications || (applications && applications.length <= 1)) continue

                    const highestPriority = this.getHighestPriority(applications);

                    if (this.removeLowerPriorityApplications(
                        candidateId, highestPriority, applications, sortedCandidates, candidateApplications
                    )) {
                        backtrack = true;
                        break;
                    }
                }
                if (backtrack) break;
            }
        }
        return sortedCandidates;
    }

    private removeLowerPriorityApplications(
        candidateId: number,
        highestPriority: number,
        applications: { profileId: number, priority: number }[],
        sortedCandidateLists: Map<number, { accepted: Application[], reserve: Application[] }>,
        candidateApplications: Map<number, { profileId: number, priority: number }[]>,
    ) {
        let flag = false;
        for (const {profileId, priority} of applications) {
            if (priority !== highestPriority) {
                const {accepted, reserve} = sortedCandidateLists.get(profileId)!;
                const indexInAccepted = accepted.findIndex(app => app.candidateId === candidateId);
                if (indexInAccepted !== -1) {
                    const [removed] = accepted.splice(indexInAccepted, 1);
                    if (reserve.length > 0) {
                        const movedApp = reserve.shift()!;
                        accepted.push(movedApp);
                        const candidateApps = candidateApplications.get(movedApp.candidateId);
                        if (candidateApps) {
                            candidateApps.push(movedApp);
                        } else {
                            candidateApplications.set(movedApp.candidateId, [movedApp]);
                        }
                    }

                    candidateApplications.set(candidateId, applications.filter(app => app !== removed));
                    flag = true;
                }

            }
        }
        return flag;
    }

    private mapApplicationsByCandidate(sortedCandidateLists: Map<number, {
        accepted: Application[],
        reserve: Application[]
    }>) {
        const candidateApplications = new Map<number, ApplicationRequest[]>();

        for (const [profileId, {accepted}] of sortedCandidateLists.entries()) {
            for (const application of accepted) {
                if (!candidateApplications.has(application.candidateId)) {
                    candidateApplications.set(application.candidateId, []);
                }
                candidateApplications.get(application.candidateId)!.push({profileId, priority: application.priority});
            }
        }
        return candidateApplications;
    }

    private getHighestPriority(applications: { profileId: number, priority: number }[]) {
        return applications.reduce((highest, current) =>
            current.priority < highest.priority ? current : highest
        ).priority;
    }

    private async updateApplicationStatuses(accepted: Application[], profileId: number, t: ITask<any>) {
        const applications = await this.applicationService.getAllPendingApplicationsByProfile(profileId);
        for (let application of applications) {
            await this.applicationService.updateApplicationStatus(
                application.id,
                (accepted.some(a => a.candidateId == application.candidateId))
                    ? ApplicationStatus.Accepted
                    : ApplicationStatus.Rejected,
                t
            );
        }
    }
}