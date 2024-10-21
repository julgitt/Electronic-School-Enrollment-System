import { db, ITask } from '../db';
import { Application } from '../models/applicationModel';

export class ApplicationRepository {
    async getByUserAndStage(userId: number, stage: number): Promise<Application[] | null> {
        const query = `
            SELECT *
            FROM applications
            WHERE user_id = $1 AND stage = $2
        `

        const applications: Application[] = await db.query(query, [userId, stage])
        return applications || null;
    }

    async insert(newApp: Application, t: ITask<any>): Promise<void> {
        const query = `
            INSERT INTO applications (user_id, school_id, first_name, last_name, pesel, stage, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;

        await t.none(
            query,
            [newApp.userId, newApp.schoolId, newApp.firstName, newApp.lastName, newApp.pesel, newApp.stage, newApp.status]
        );
    }
}