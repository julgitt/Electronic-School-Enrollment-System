import {ApplicationStatus} from "./applicationStatus";
import {Candidate} from "../candidate/candidate";

export interface ApplicationWithCandidate {
    id: number;
    profileId: number;
    candidate: Candidate;
    points: number;
    priority: number;
    status: ApplicationStatus;
}
