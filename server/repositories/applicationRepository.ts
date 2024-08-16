import applications, { Application } from '../models/applicationModel';

export class ApplicationRepository {
    constructor() {}

    async getApplicationByUserAndStage(userId:number, stage:number): Promise<Application | null> {
        return applications.find(application => application.userId === userId
                                                            && application.stage === application.stage) || null
    }

    async insertApplication(newApplication: Application): Promise<Application> {
        const isExisting = await this.getApplicationByUserAndStage(newApplication.userId, newApplication.stage);
        if (isExisting) {
            throw new Error('Application already exists.');
        }
        applications.push(newApplication);
        return newApplication;
    }
}
