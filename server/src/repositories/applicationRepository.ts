import {db, ITask} from '../db';
import {ApplicationEntity} from "../models/applicationEntity";

export class ApplicationRepository {
    async getAllByCandidate(candidateId: number): Promise<ApplicationEntity[]> {
        const query = `
            SELECT a.candidate_id as candidate_id,
                   p.id           AS profile_id,
                   s.id           AS school_id,
                   a.priority,
                   a.status,
                   a.round,
                   a.created_at,
                   a.updated_at
            FROM applications a
                     JOIN profiles p ON a.profile_id = p.id
                     JOIN schools s ON p.school_id = s.id
            WHERE candidate_id = $1
        `;

        return await db.query(query, [candidateId]);
    }

    async updateStatus(id: number, status: string): Promise<void> {
        const query = `
            UPDATE applications
            SET status = $2
            WHERE id = $1
        `;

        return await db.query(query, [id, status]);
    }

    async getMaxPriority(): Promise<number> {
        const query = `
            SELECT priority
            FROM applications
            ORDER BY priority DESC
            LIMIT 1;
        `;

        return await db.query(query);
    }

    async getAllPendingByProfileAndPriority(profileId: number, priority: number): Promise<ApplicationEntity[]> {
        const query = `
            SELECT *
            FROM applications
            WHERE profile_id = $1
              and priority = $2
              and status = 'pending'
        `;

        return await db.query(query, [profileId, priority]);
    }

    async getEnrolledByProfile(profileId: number): Promise<number> {
        const query = `
            COUNT *
            FROM applications
            WHERE profile_id = $1 and status = 'accepted'
        `;

        return await db.query(query, [profileId]);
    }

    async insert(newApp: ApplicationEntity, t: ITask<any>): Promise<void> {
        const query = `
            INSERT INTO applications (candidate_id, profile_id, priority, round, status)
            VALUES ($1, $2, $3, $4, $5)
        `;

        await t.none(
            query,
            [newApp.candidateId, newApp.profileId, newApp.priority, newApp.round, newApp.status]
        );
    }

    async delete(profileId: number, candidateId: number, t: ITask<any>): Promise<void> {
        const query = `
            DELETE
            FROM applications
            WHERE profile_id = $1
              AND candidate_id = $2
        `;

        await t.none(query, [profileId, candidateId]);
    }
}