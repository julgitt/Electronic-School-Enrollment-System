import { db, ITask } from '../db';
import { Application } from '../models/applicationModel';

export class ApplicationRepository {
    async getAllByUser(userId: number): Promise<Application[] | null> {
        const query = `
            SELECT 
                a.pesel,
                a.stage,
                a.status,
                a.user_id,
                a.school_id,
                a.first_name,
                a.last_name,
                a.created_at,
                a.updated_at,
                s.name AS school_name
            FROM applications a
            JOIN schools s ON a.school_id = s.id
            WHERE user_id = $1
        `;

        const applications: Application[] = await db.query(query, [userId])
        console.log(applications);
        return applications || null;
    }

    async insert(newApp: Omit<Application, 'schoolName'>, t: ITask<any>): Promise<void> {
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