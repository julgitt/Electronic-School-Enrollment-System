import {ApplicationService} from "./applicationService";
import {ApplicationStatus} from "../dto/application/applicationStatus";
import {ApplicationRequest} from "../dto/application/applicationRequest";
import {transactionFunction} from "../db";
import {RankedApplication, RankListWithInfo} from "../dto/application/rankedApplication";
import {ApplicationWithInfo} from "../dto/application/applicationWithInfo";
import { RankListService } from "./rankListService";


export class AdminService {
    constructor(
        private rankListService: RankListService,
        private applicationService: ApplicationService,
        private readonly tx: transactionFunction
    ) {
    }

    async processProfileEnrollments(): Promise<ApplicationWithInfo[]> {
        let startTime = performance.now();
        const rankListsByProfile = await this.rankListService.getAllRankLists();
        let endTime = performance.now();
        console.log("rank:" + (endTime - startTime));
        startTime = performance.now();
        const finalEnrollmentLists = this.finalizeEnrollmentProcess(rankListsByProfile);
        endTime = performance.now();
        console.log("enroll:" + (endTime - startTime));
        startTime = performance.now();
        const applications = await this.updateApplicationStatuses(finalEnrollmentLists);
        endTime = performance.now();
        console.log("update:" + (endTime - startTime));
        return applications
    }

    private finalizeEnrollmentProcess(rankListsByProfile: Map<number, RankListWithInfo>) {
        const applicationsByCandidate = this.toApplicationsByCandidate(rankListsByProfile)

        for (const [, {accepted}] of rankListsByProfile) {
            this.processProfileApplications(accepted, applicationsByCandidate, rankListsByProfile);
        }
        return rankListsByProfile;
    }

    private toApplicationsByCandidate(rankedListsByProfile: Map<number, RankListWithInfo>) {
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

    private processProfileApplications(
        accepted: RankedApplication[],
        applicationsByCandidate: Map<number, ApplicationRequest[]>,
        rankListsByProfile: Map<number, RankListWithInfo>
    ) : void {
        for (const application of accepted) {
            const candidateId = application.candidate.id;
            const candidateApplications = applicationsByCandidate.get(candidateId);
            if (!candidateApplications) continue;

            const highestPriority = this.getHighestPriority(candidateApplications);

            this.removeLowerPriorityApplications(
                candidateId,
                highestPriority,
                candidateApplications,
                rankListsByProfile,
                applicationsByCandidate
            );
        }
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
        rankListsByProfile: Map<number, RankListWithInfo>,
        applicationsByCandidate: Map<number, ApplicationRequest[]>,
    ) {
        for (const {profileId, priority} of candidateApplications) {
            if (priority === highestPriority) continue;

            const rankList = rankListsByProfile.get(profileId);
            const {accepted, reserve, rejected} = rankList || {accepted: [], reserve: [], rejected: []};

            const removed = this.removeApp(candidateId, profileId, accepted, rejected, applicationsByCandidate);
            if (!removed) continue;

            this.moveAppFromReserveToAccepted(profileId, reserve, accepted, applicationsByCandidate);
        }

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

    private async updateApplicationStatuses(finalEnrollmentLists: Map<number, RankListWithInfo>) {
        const updatedApplications: ApplicationWithInfo[] = []
        await this.tx(async t => {
            for (const [_profileId, rankLists] of finalEnrollmentLists.entries()) {
                const allApplications = [
                    ...rankLists.accepted.map(app => ({
                        ...app,
                        status: ApplicationStatus.Accepted,
                        profile: rankLists.profile
                    })),
                    ...rankLists.reserve.map(app => ({
                        ...app,
                        status: ApplicationStatus.Rejected,
                        profile: rankLists.profile
                    })),
                    ...rankLists.rejected.map(app => ({
                        ...app,
                        status: ApplicationStatus.Rejected,
                        profile: rankLists.profile
                    })),
                ];
                for (const a of allApplications) {
                    await this.applicationService.updateApplicationStatus(a.id, a.status, t);
                    updatedApplications.push(a);
                }
            }
        });
        return updatedApplications;
    }
}