export interface Application {
    id: number
    studentId: number;
    classId: number;
    priority: number;
    status: string;
    submittedAt?: Date;
}