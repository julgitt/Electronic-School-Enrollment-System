import {ApplicationService} from "./applicationService";
import {ProfileService} from "./profileService";
import {CandidateService} from "./candidateService";
import {Profile} from "../dto/profile/profile";
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
        private profileService: ProfileService,
        private applicationService: ApplicationService,
        private readonly tx: (callback: (t: ITask<any>) => Promise<void>) => Promise<void>
    ) {
    }

    async processProfileEnrollments(): Promise<void> {
        const sortedCandidateLists = await this.profileService.createSortedCandidateListsByProfile();
        const finalEnrollmentLists = await this.finalizeEnrollmentProcess(sortedCandidateLists);

        await this.tx(async t => {
            for (const [profileId, enrollment] of finalEnrollmentLists.entries()) {
                if (enrollment) {
                    await this.updateApplicationStatuses(enrollment.accepted, profileId, t);
                }
            }
        });
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