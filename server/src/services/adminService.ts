import {ApplicationService} from "./applicationService";
import {ApplicationStatus} from "../dto/application/applicationStatus";
import {transactionFunction} from "../db";
import {EnrollmentLists} from "../dto/application/rankedApplication";
import {ApplicationWithInfo} from "../dto/application/applicationWithInfo";
import { RankListService } from "./rankListService";
import {appendFile} from 'fs'


export class AdminService {
    constructor(
        private rankListService: RankListService,
        private applicationService: ApplicationService,
        private readonly tx: transactionFunction
    ) {
    }

    async processProfileEnrollments(): Promise<ApplicationWithInfo[]> {
        const rankLists = await this.rankListService.getEnrollmentLists()
        const finalEnrollmentLists = this.finalizeEnrollmentProcess(rankLists)
        const applications = await this.updateApplicationStatuses(finalEnrollmentLists)
        return applications
    }

    private finalizeEnrollmentProcess(rankLists: EnrollmentLists): EnrollmentLists {
        const acceptedByCandidate = new Map<number, ApplicationWithInfo>()
        const rejected: ApplicationWithInfo[] = []
        const applicationsToProcess: ApplicationWithInfo[] = rankLists.accepted
        const reserveByProfile = rankLists.reserveByProfile

        while(applicationsToProcess.length > 0) {
            const application = applicationsToProcess.pop()!
            const candidateId = application.candidate.id
            const candidateApplication = acceptedByCandidate.get(candidateId)

            const foundLowerPriority = candidateApplication && candidateApplication.priority > application.priority

            if (foundLowerPriority) continue

            acceptedByCandidate.set(candidateId, application)
                
            if (candidateApplication) {
                const reserve = reserveByProfile.get(candidateApplication.profile.id)!
                const newApp = reserve.shift()
                if (!newApp) break

                applicationsToProcess.push(newApp)
            }
        }
        
        return {acceptedByCandidate, rejected, reserveByProfile} as EnrollmentLists
    }

    private async updateApplicationStatuses(finalEnrollmentLists: EnrollmentLists) {
        const updatedApplications: ApplicationWithInfo[] = []
        appendFile(
            'executionTime.txt',
            `${performance.now()} end\n`,
            (err) => {
                if (err) console.log("Error:" + err);
            }
        );
        await this.tx(async t => {
            for (const a of finalEnrollmentLists.rejected) {
                await this.applicationService.updateApplicationStatus(a.id, ApplicationStatus.Rejected, t);
                updatedApplications.push(a);
            }
            for (const [_candidateId, a] of finalEnrollmentLists.acceptedByCandidate){
                await this.applicationService.updateApplicationStatus(a.id, ApplicationStatus.Accepted, t);
                updatedApplications.push(a);
            }
            for (const [_profileId, reserve] of finalEnrollmentLists.reserveByProfile){
                for (const a of reserve) {
                    await this.applicationService.updateApplicationStatus(a.id, ApplicationStatus.Rejected, t);
                    updatedApplications.push(a);
                }
            }
        });
        return updatedApplications;
    }
}
