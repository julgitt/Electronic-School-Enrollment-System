import {ApplicationStatus} from "./applicationStatus";
import {Candidate} from "../candidate/candidate";
import {Profile} from "../profile/profile";
import {ProfileWithInfo} from "../profile/profileInfo";

export type RankList = { profile: ProfileWithInfo, accepted: RankedApplication[], reserve: RankedApplication[], rejected: RankedApplication[] };

export interface RankedApplication {
    id: number;
    candidate: Candidate;
    points: number;
    priority: number;
    status: ApplicationStatus;
}
