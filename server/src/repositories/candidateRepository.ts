import { db } from '../db';
import { Candidate } from '../models/candidateModel';

export class CandidateRepository {
    async getByIdAndUserId(id: number, userId: number): Promise<Candidate | null> {
        const query = `
            SELECT * FROM candidates
            WHERE id = $1 AND user_id = $2
            LIMIT 1
        `;
        return await db.oneOrNone(query, [id, userId]);
    }

    async getByPesel(pesel: string): Promise<Candidate | null> {
        const query = `
            SELECT * FROM candidates
            WHERE pesel = $1
            LIMIT 1
        `;
        return await db.oneOrNone(query, [pesel]);
    }

    async getAllByUserId(userId: number): Promise<Candidate[]> {
        const query = `
            SELECT * FROM candidates
            WHERE user_id = $1
        `

        return await db.query(query, [userId]);
    }

    async getLastUpdatedByUserId(userId: number): Promise<Candidate | null> {
        const query = `
            SELECT * FROM candidates
            WHERE user_id = $1
            ORDER BY updated_at DESC
            LIMIT 1;
        `;
        return await db.oneOrNone(query, [userId]);
    }

    async insert(newCandidate: Candidate): Promise<Candidate> {
        const query = `
            INSERT INTO candidates (first_name, last_name, pesel, user_id)
            VALUES ($1, $2, $3, $4)
            RETURNING id;
        `;

        const values = [newCandidate.firstName, newCandidate.lastName, newCandidate.pesel, newCandidate.userId];
        return db.one(query, values);
    }
}
