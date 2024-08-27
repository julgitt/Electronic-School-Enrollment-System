export interface Application {
    applicationId: number;
    userId: number;
    schools: string[];
    stage: number;
    pesel: string;
    firstName: string;
    lastName: string;
    status: string;
}

const application: Application[] = [];

export default application;
