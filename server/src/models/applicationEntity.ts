import {ApplicationStatus} from "../dto/application/applicationStatus";

export interface ApplicationEntity {
    id: number;
    candidateId: number;
    profileId: number;
    priority: number;
    enrollmentId: number;
    status: ApplicationStatus;
    createdAt: Date | number;
    updatedAt: Date | number;
}
