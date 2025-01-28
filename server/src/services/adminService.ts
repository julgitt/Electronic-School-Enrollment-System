import {ApplicationService} from "./applicationService";
import {ApplicationStatus} from "../dto/application/applicationStatus";
import {transactionFunction} from "../db";
import {EnrollmentLists} from "../dto/application/rankedApplication";
import {ApplicationWithInfo} from "../dto/application/applicationWithInfo";
import {RankListService} from "./rankListService";
import {appendFile} from 'fs'
import {EnrollmentService} from "./enrollmentService";


export class AdminService {
    constructor(
        private rankListService: RankListService,
        private applicationService: ApplicationService,
        private enrollmentService: EnrollmentService,
        private readonly tx: transactionFunction
    ) {
    }

    /**
     * Przeprowadza proces naboru.
     *
     * @returns {Promise<ApplicationWithInfo[]> zwraca tablicę obiektów aplikacji, których statusy zostały zaktualizowane w wyniku naboru}
     */
    async processProfileEnrollments(): Promise<ApplicationWithInfo[]> {
        const rankLists = await this.rankListService.getEnrollmentLists()
        const finalEnrollmentLists = this.finalizeEnrollmentProcess(rankLists)
        const applications = await this.updateApplicationStatuses(finalEnrollmentLists)
        await this.enrollmentService.endEnrollment();
        return applications
    }

    private finalizeEnrollmentProcess(rankLists: EnrollmentLists): EnrollmentLists {
        const acceptedByCandidate = new Map<number, ApplicationWithInfo>()
        const rejected: ApplicationWithInfo[] = []
        const applicationsToProcess: ApplicationWithInfo[] = rankLists.accepted
        const reserveByProfile = rankLists.reserveByProfile

        while (applicationsToProcess.length > 0) {
            const application = applicationsToProcess.pop()!
            const candidateId = application.candidate.id
            const candidateApplication = acceptedByCandidate.get(candidateId)

            const isLowerPriority = candidateApplication != null && candidateApplication.priority < application.priority

            const applicationToRemove = isLowerPriority ? application : candidateApplication
            const applicationToAccept = isLowerPriority ? candidateApplication : application

            acceptedByCandidate.set(candidateId, applicationToAccept)

            if (applicationToRemove == null) continue

            rejected.push(applicationToRemove)
            const reserve = reserveByProfile.get(applicationToRemove.profile.id)!
            const newApp = reserve.shift()
            if (!newApp) continue

            applicationsToProcess.push(newApp)
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
                a.status = ApplicationStatus.Rejected
                await this.applicationService.updateApplicationStatus(a.id, a.status, t);
                updatedApplications.push(a);
            }
            for (const [_candidateId, a] of finalEnrollmentLists.acceptedByCandidate) {
                a.status = ApplicationStatus.Accepted
                await this.applicationService.updateApplicationStatus(a.id, a.status, t);
                updatedApplications.push(a);
            }
            for (const [_profileId, reserve] of finalEnrollmentLists.reserveByProfile) {
                for (const a of reserve) {
                    a.status = ApplicationStatus.Rejected
                    await this.applicationService.updateApplicationStatus(a.id, a.status, t);
                    updatedApplications.push(a);
                }
            }
        });
        return updatedApplications;
    }
}
