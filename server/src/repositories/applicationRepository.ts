import { db, ITask } from '../db';
import { Application } from '../models/applicationModel';

export class ApplicationRepository {
    async getAllByCandidate(candidateId: number): Promise<Application[]> {
        const query = `
            SELECT 
                a.pesel,
                a.stage,
                a.status,
                a.candidate_id,
                a.school_id,
                a.first_name,
                a.last_name,
                a.created_at,
                a.updated_at,
                s.name AS school_name
            FROM applications a
            JOIN schools s ON a.school_id = s.id
            WHERE candidate_id = $1
        `;

        return await db.query(query, [candidateId]);
    }

    async insert(newApp: Omit<Application, 'schoolName'>, t: ITask<any>): Promise<void> {
        const query = `
            INSERT INTO applications (candidate_id, school_id, first_name, last_name, pesel, stage, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;

        await t.none(
            query,
            [newApp.candidateId, newApp.schoolId, newApp.firstName, newApp.lastName, newApp.pesel, newApp.stage, newApp.status]
        );
    }

    async delete(schoolId: number, candidateId: number, t: ITask<any>): Promise<void> {
        const query = `
            DELETE FROM applications
            WHERE school_id = $1 AND candidate_id = $2;
        `;

        await t.none(query, [schoolId, candidateId]);
    }
}