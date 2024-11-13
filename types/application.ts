export interface Application {
    id: number
    candidateId: number;
    classId: number;
    priority: number;
    status: string;
    submittedAt?: Date;
}