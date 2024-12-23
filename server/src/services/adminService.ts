import {ApplicationService} from "./applicationService";
import {ProfileService} from "./profileService";
import {ApplicationStatus} from "../dto/application/applicationStatus";
import {ApplicationRequest} from "../dto/application/applicationRequest";
import {transactionFunction} from "../db";
import {RankedApplication, RankList} from "../dto/application/rankedApplication";


export class AdminService {
    constructor(
        private profileService: ProfileService,
        private applicationService: ApplicationService,
        private readonly tx: transactionFunction
    ) {
    }

    async processProfileEnrollments(): Promise<void> {
        const rankListsByProfile = await this.profileService.getAllRankLists();
        const finalEnrollmentLists = await this.finalizeEnrollmentProcess(rankListsByProfile);
        await this.updateApplicationStatuses(finalEnrollmentLists);
    }

    private async finalizeEnrollmentProcess(rankListsByProfile: Map<number, RankList>) {
        const applicationsByCandidate = this.toApplicationsByCandidate(rankListsByProfile)
        let backtrack = true;

        while (backtrack) {
            backtrack = false;
            for (const [, {accepted}] of rankListsByProfile) {
                backtrack = await this.processProfileApplications(accepted, applicationsByCandidate, rankListsByProfile);
                if (backtrack) break;
            }
        }
        return rankListsByProfile;
    }

    private toApplicationsByCandidate(rankedListsByProfile: Map<number, RankList>) {
        const applicationsByCandidate = new Map<number, ApplicationRequest[]>();

        for (const [profileId, {accepted}] of rankedListsByProfile.entries()) {
            for (const application of accepted) {
                const candidateId = application.candidate.id;

                const applications = applicationsByCandidate.get(candidateId) || [];
                applications.push({profileId, priority: application.priority});

                applicationsByCandidate.set(candidateId, applications);
            }
        }
        return applicationsByCandidate;
    }

    private async processProfileApplications(
        accepted: RankedApplication[],
        applicationsByCandidate: Map<number, ApplicationRequest[]>,
        rankListsByProfile: Map<number, RankList>
    ): Promise<boolean> {
        for (const application of accepted) {
            const candidateId = application.candidate.id;
            const candidateApplications = applicationsByCandidate.get(candidateId);
            if (!candidateApplications) continue;

            const highestPriority = this.getHighestPriority(candidateApplications);

            const removed = this.removeLowerPriorityApplications(
                candidateId,
                highestPriority,
                candidateApplications,
                rankListsByProfile,
                applicationsByCandidate
            );

            if (removed) {
                return true;
            }
        }
        return false;
    }

    private getHighestPriority(applications: ApplicationRequest[]) {
        return applications.reduce((highest, current) =>
            current.priority < highest.priority ? current : highest
        ).priority;
    }

    private removeLowerPriorityApplications(
        candidateId: number,
        highestPriority: number,
        candidateApplications: ApplicationRequest[],
        rankListsByProfile: Map<number, RankList>,
        applicationsByCandidate: Map<number, ApplicationRequest[]>,
    ) {
        let removedFlag = false;

        for (const {profileId, priority} of candidateApplications) {
            if (priority === highestPriority) continue;

            const rankList = rankListsByProfile.get(profileId);
            const {accepted, reserve, rejected} = rankList || {accepted: [], reserve: [], rejected: []};

            const removed = this.removeApp(candidateId, profileId, accepted, rejected, applicationsByCandidate);
            if (!removed) continue;

            removedFlag = true;
            this.moveAppFromReserveToAccepted(profileId, reserve, accepted, applicationsByCandidate);
        }

        return removedFlag;
    }

    private removeApp(candidateId: number, profileId: number, accepted: RankedApplication[], rejected: RankedApplication[], applicationsByCandidate: Map<number, ApplicationRequest[]>) {
        const indexToRemove = accepted.findIndex(app => app.candidate.id === candidateId);
        if (indexToRemove === -1) return false;
        const removed = accepted.splice(indexToRemove, 1);
        rejected.push(removed[0]);

        const applications = applicationsByCandidate.get(candidateId) || [];
        applicationsByCandidate.set(candidateId, applications.filter(app => app.profileId !== profileId));

        return true;
    }

    private moveAppFromReserveToAccepted(profileId: number, reserve: RankedApplication[], accepted: RankedApplication[], applicationsByCandidate: Map<number, ApplicationRequest[]>) {
        const movedApp = reserve.shift();
        if (!movedApp) return

        accepted.push(movedApp);

        const candidateApps = applicationsByCandidate.get(movedApp.candidate.id) || [];
        candidateApps.push({profileId, priority: movedApp.priority});
        applicationsByCandidate.set(movedApp.candidate.id, candidateApps);
    }

    private async updateApplicationStatuses(finalEnrollmentLists: Map<number, RankList>) {
        await this.tx(async t => {
            for (const [_profileId, rankLists] of finalEnrollmentLists.entries()) {
                const allApplications = [
                    ...rankLists.accepted.map(app => ({id: app.id, status: ApplicationStatus.Accepted})),
                    ...rankLists.reserve.map(app => ({id: app.id, status: ApplicationStatus.Rejected})),
                    ...rankLists.rejected.map(app => ({id: app.id, status: ApplicationStatus.Rejected})),
                ];
                for (const {id, status} of allApplications) {
                    await this.applicationService.updateApplicationStatus(id, status, t);
                }
            }
        });
    }
}