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
        const query = `
            INSERT INTO applications (user_id, school_id, first_name, last_name, pesel, stage, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        return await db.one(
            query,
            [newApp.userId, newApp.schoolId, newApp.firstName, newApp.lastName, newApp.pesel, newApp.stage, newApp.status]
        );
    }
}
