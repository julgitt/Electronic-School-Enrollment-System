export interface ApplicationModel {
    id?: number;
    candidateId: number;
    profileId: number;
    priority: number;
    stage: number;
    status: string;
    submittedAt?: Date | number;
    updatedAt?: Date | number;
}
