import { db, ITask } from '../db';
import { Application } from '../models/applicationModel';

export class ApplicationRepository {
    async getAllByCandidate(candidateId: number): Promise<Application[]> {
        const query = `
            SELECT 
                a.stage,
                a.status,
                a.candidate_id,
                a.priority,
                a.profile_id,
                a.created_at,
                a.updated_at,
                p.name AS profile_name,
                s.name AS school_name
            FROM applications a
            JOIN profiles p ON a.profile_id = p.id
            JOIN schools s ON p.school_id = s.id
            WHERE candidate_id = $1
        `;

        return await db.query(query, [candidateId]);
    }

    async insert(newApp: Application, t: ITask<any>): Promise<void> {
        const query = `
            INSERT INTO applications (candidate_id, profile_id, priority, stage, status)
            VALUES ($1, $2, $3, $4 $4)
        `;

        await t.none(
            query,
            [newApp.candidateId, newApp.profileId, newApp.priority, newApp.stage, newApp.status]
        );
    }

    async delete(profileId: number, candidateId: number, t: ITask<any>): Promise<void> {
        const query = `
            DELETE FROM applications
            WHERE profile_id = $1 AND candidate_id = $2;
        `;

        await t.none(query, [profileId, candidateId]);
    }
}