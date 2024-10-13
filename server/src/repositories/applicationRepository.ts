import { Application } from '../models/applicationModel';
import { db } from '../db';

class ApplicationRepository {
    async getByUserAndStage(userId: number, stage:number): Promise<Application[] | null> {
        const query = `
            SELECT *
            FROM applications
            WHERE user_id = $1 AND stage = $2
        `

        const applications: Application[] = await db.query(query, [userId, stage])
        return applications || null;
    }

    async insert(newApp: Application): Promise<void> {
        const query = `
            INSERT INTO applications (user_id, school_id, first_name, last_name, pesel, stage, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;

        await db.query(
            query,
            [newApp.userId, newApp.schoolId, newApp.firstName, newApp.lastName, newApp.pesel, newApp.stage, newApp.status]
        );
    }
}

export default new ApplicationRepository()
