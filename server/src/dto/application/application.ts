import {ApplicationStatus} from "./applicationStatus";

export interface Application {
    id: number;
    profileId: number;
    candidateId: number;
    priority: number;
    status: ApplicationStatus;
}