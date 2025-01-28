import {ApplicationStatus} from "./applicationStatus";
import {Candidate} from "../candidate/candidate";
import {ApplicationWithInfo} from "./applicationWithInfo";

export type RankList = {
    accepted: RankedApplication[],
    reserve: RankedApplication[],
    prevAccepted: RankedApplication[]
};

export type EnrollmentLists = {
    acceptedByCandidate: Map<number, ApplicationWithInfo>
    accepted: ApplicationWithInfo[],
    rejected: ApplicationWithInfo[],
    reserveByProfile: Map<number, ApplicationWithInfo[]>
};

export interface RankedApplication {
    id: number;
    candidate: Candidate;
    points: number;
    priority: number;
    status: ApplicationStatus;
}
