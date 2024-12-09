export interface Application {
    id: number;
    profileId: number;
    candidateId: number;
    priority: number;
    enrollmentId: number;
    status: 'pending' | 'rejected' | 'accepted';
    createdAt: Date | number;
    updatedAt: Date | number;
}
