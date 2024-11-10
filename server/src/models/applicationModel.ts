export interface Application {
    id?: number;
    userId: number;
    schoolId: number;
    stage: number;
    pesel: string;
    schoolName?: string;
    firstName: string;
    lastName: string;
    status: string;
}
