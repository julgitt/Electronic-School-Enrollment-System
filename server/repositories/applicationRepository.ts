import applications, { Application } from '../models/applicationModel';
import db from './db';

export class ApplicationRepository {
    constructor() {}

    async getApplicationByUserAndStage(userId:number, stage:number): Promise<Application | null> {
        const application = await db.oneOrNone(
            'SELECT * FROM applications WHERE user_id = $1 AND stage = $2',
            [userId, stage]
        );
        return application || null;
    }

    async insertApplication(newApplication: Application): Promise<Application> {
        const isExisting = await this.getApplicationByUserAndStage(newApplication.userId, newApplication.stage);
        if (isExisting) {
            throw new Error('Application already exists.');
        }
        const result = await db.one(
            'INSERT INTO applications(user_id, stage, other_column) VALUES($1, $2, $3) RETURNING *',
            [newApplication.applicationId, newApplication.userId, newApplication.stage, newApplication.otherColumn]
        );

        return result;
    }
}