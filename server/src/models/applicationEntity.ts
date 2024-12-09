export interface ApplicationEntity {
    id: number;
    candidateId: number;
    profileId: number;
    priority: number;
    round: number;
    status: 'pending' | 'rejected' | 'accepted';
    submittedAt: Date | number;
    updatedAt: Date | number;
}
