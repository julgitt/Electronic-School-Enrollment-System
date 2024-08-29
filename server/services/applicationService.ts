import { ApplicationRepository } from '../repositories/applicationRepository';
import { Application } from '../models/applicationModel';

export class ApplicationService {
    private repo: ApplicationRepository;

    constructor() {
        this.repo = new ApplicationRepository();
    }

    async addApplication(firstName: string, lastName: string, pesel: string, schools: number[], userId: number): Promise<Application[]> {
        const applicationPromises = schools.map(schoolId => {
            const newApplication: Application = {
                userId: userId,
                schoolId: schoolId,
                firstName: firstName,
                lastName: lastName,
                pesel: pesel,
                stage: 1,
                status: 'pending',
            };
            return this.repo.insertApplication(newApplication);
        });

        return await Promise.all(applicationPromises);
    }
}
