import {ApplicationStatus} from "./applicationStatus";
import {Candidate} from "../candidate/candidate";

export type RankList = { accepted: RankedApplication[], reserve: RankedApplication[], rejected: RankedApplication[] };

export interface RankedApplication {
    id: number;
    candidate: Candidate;
    points: number;
    priority: number;
    status: ApplicationStatus;
}
