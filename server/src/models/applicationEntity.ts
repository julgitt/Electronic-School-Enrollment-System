export interface ApplicationEntity {
    id: number;
    candidateId: number;
    profileId: number;
    priority: number;
    enrollmentId: number;
    status: 'pending' | 'rejected' | 'accepted';
    createdAt: Date | number;
    updatedAt: Date | number;
}
