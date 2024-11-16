export interface Application {
    id: number
    candidateId: number;
    schoolId: number;
    stage: number;
    pesel: string;
    schoolName: string;
    firstName: string;
    lastName: string;
    status: string;
    submittedAt: Date;
}