import { ApplicationRepository } from '../repositories/applicationRepository';
import { Application } from '../models/applicationModel';

export class ApplicationService {
    private repo: ApplicationRepository;

    constructor() {
        this.repo = new ApplicationRepository();
    }

    async addApplication(firstName: string, lastName: string, pesel: string, schools: string[], userId: number): Promise<Application> {
        const id = new Date().getTime();

        const newApplication: Application = {
            applicationId: id,
            firstName: firstName,
            lastName: lastName,
            pesel: pesel,
            userId: userId,
            stage: 1,
            schools: schools,
            status: 'pending',
        };

        return await this.repo.insertApplication(newApplication);
    }
}
