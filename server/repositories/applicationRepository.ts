import { Application } from '../models/applicationModel';
import { db } from '../db';

export class ApplicationRepository {
    constructor() {}

    async getApplicationByUserAndStage(userId:number, stage:number): Promise<Application | null> {
        const application = await db.oneOrNone(
            'SELECT * FROM applications WHERE user_id = $1 AND stage = $2',
            [userId, stage]
        );
        return application || null;
    }

    async insertApplication(newApp: Application): Promise<Application> {
        const isExisting = await this.getApplicationByUserAndStage(newApp.userId, newApp.stage);
        if (isExisting) {
            throw new Error('Application already exists.');
        }
        return await db.one(
            'INSERT INTO applications(user_id, stage, other_column) VALUES($1, $2, $3) RETURNING *',
            [newApp.userId, newApp.schoolId, newApp.stage, newApp.pesel, newApp.firstName, newApp.status]
        );
    }
}
