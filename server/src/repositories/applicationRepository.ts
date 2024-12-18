import {db, ITask} from '../db';
import {ApplicationEntity} from "../models/applicationEntity";
import {ApplicationStatus} from "../dto/application/applicationStatus";

export class ApplicationRepository {

    async getAllByCandidateAndEnrollmentId(candidateId: number, enrollmentId: number): Promise<ApplicationEntity[]> {
        const query = `
            SELECT a.candidate_id as candidate_id,
                   p.id           AS profile_id,
                   s.id           AS school_id,
                   a.priority,
                   a.status,
                   a.enrollment_id,
                   a.created_at,
                   a.updated_at
            FROM applications a
                     JOIN profiles p ON a.profile_id = p.id
                     JOIN schools s ON p.school_id = s.id
            WHERE candidate_id = $1
              and enrollment_id = $2
        `;

        return await db.query(query, [candidateId, enrollmentId]);
    }

    async getAllByCandidate(candidateId: number): Promise<ApplicationEntity[]> {
        const query = `
            SELECT a.id,
                   a.candidate_id,
                   p.id AS profile_id,
                   s.id AS school_id,
                   a.priority,
                   a.status,
                   a.enrollment_id,
                   a.created_at,
                   a.updated_at
            FROM applications a
                     JOIN profiles p ON a.profile_id = p.id
                     JOIN schools s ON p.school_id = s.id
            WHERE candidate_id = $1
            ORDER BY date_part('year', a.updated_at) DESC, a.priority
        `;

        return await db.query(query, [candidateId]);
    }

    async updateStatus(id: number, status: string, t: ITask<any>): Promise<void> {
        const query = `
            UPDATE applications
            SET status = $2
            WHERE id = $1
        `;

        await t.none(query, [id, status]);
    }

    async getAllPendingByProfile(profileId: number): Promise<ApplicationEntity[]> {
        const status = ApplicationStatus.Pending;
        const query = `
            SELECT *
            FROM applications
            WHERE profile_id = $1
              and status = $2
        `;

        return db.query(query, [profileId, status]);
    }

    async getAllAcceptedByProfile(profileId: number): Promise<ApplicationEntity[]> {
        const status = ApplicationStatus.Accepted
        const query = `
            SELECT *
            FROM applications
            WHERE profile_id = $1
              and status = $2
        `;

        return db.query(query, [profileId, status]);
    }

    async insert(newApp: ApplicationEntity, t: ITask<any>): Promise<void> {
        const query = `
            INSERT INTO applications (candidate_id, profile_id, priority, enrollment_id, status)
            VALUES ($1, $2, $3, $4, $5)
        `;

        await t.none(
            query,
            [newApp.candidateId, newApp.profileId, newApp.priority, newApp.enrollmentId, newApp.status]
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