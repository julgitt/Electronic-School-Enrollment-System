import { db, ITask } from '../db';
import { ApplicationModel } from '../models/applicationModel';

export class ApplicationRepository {
    async getAllByCandidate(candidateId: number): Promise<ApplicationModel[]> {
        const query = `
            SELECT
                a.candidate_id as candidate_id,
                p.id AS profile_id,
                s.id AS school_id,
                a.priority,
                a.status,
                a.stage,
                a.created_at,
                a.updated_at
            FROM applications a
            JOIN profiles p ON a.profile_id = p.id
            JOIN schools s ON p.school_id = s.id
            WHERE candidate_id = $1
        `;

        return await db.query(query, [candidateId]);
    }

    async insert(newApp: ApplicationModel, t: ITask<any>): Promise<void> {
        const query = `
            INSERT INTO applications (candidate_id, profile_id, priority, stage, status)
            VALUES ($1, $2, $3, $4, $5)
        `;

        await t.none(
            query,
            [newApp.candidateId, newApp.profileId, newApp.priority, newApp.stage, newApp.status]
        );
    }

    async delete(profileId: number, candidateId: number, t: ITask<any>): Promise<void> {
        const query = `
            DELETE FROM applications
            WHERE profile_id = $1 AND candidate_id = $2
        `;

        await t.none(query, [profileId, candidateId]);
    }
}