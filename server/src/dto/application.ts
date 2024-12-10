export interface Application {
    id: number;
    profileId: number;
    candidateId: number;
    priority: number;
    enrollmentId: number;
    status: ApplicationStatus;
    createdAt: Date | number;
    updatedAt: Date | number;
}
