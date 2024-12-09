export interface Application {
    id: number;
    profileId: number;
    candidateId: number;
    priority: number;
    round: number;
    status: 'pending' | 'rejected' | 'accepted';
    submittedAt: Date | number;
    updatedAt: Date | number;
}
