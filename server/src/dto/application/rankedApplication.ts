import {ApplicationStatus} from "./applicationStatus";
import {Candidate} from "../candidate/candidate";
import {ProfileWithInfo} from "../profile/profileInfo";

export type RankList= {
    accepted: RankedApplication[],
    reserve: RankedApplication[],
    prevAccepted: RankedApplication[]
};

export type RankListWithInfo = {
    profile: ProfileWithInfo,
    accepted: RankedApplication[],
    reserve: RankedApplication[],
    rejected: RankedApplication[]
};

export interface RankedApplication {
    id: number;
    candidate: Candidate;
    points: number;
    priority: number;
    status: ApplicationStatus;
}
