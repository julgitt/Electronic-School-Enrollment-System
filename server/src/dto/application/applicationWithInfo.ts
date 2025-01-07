import {ApplicationStatus} from "./applicationStatus";
import {Candidate} from "../candidate/candidate";
import {ProfileWithInfo} from "../profile/profileInfo";

export interface ApplicationWithInfo {
    id: number;
    candidate: Candidate;
    profile: ProfileWithInfo;
    points: number;
    priority: number;
    status: ApplicationStatus;
}
