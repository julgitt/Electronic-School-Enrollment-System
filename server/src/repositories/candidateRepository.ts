import {db} from '../db';
import {CandidateEntity} from "../models/candidateEntity";

export class CandidateRepository {
    async getById(id: number): Promise<CandidateEntity | null> {
        const query = `
            SELECT * FROM candidates
            WHERE id = $1
            LIMIT 1
        `;
        return db.oneOrNone(query, [id]);
    }

    async deleteById(id: number): Promise<void> {
        const query = `
            DELETE
            FROM candidates
            WHERE id = $1
        `;
        await db.query(query, [id]);
    }

    async getAll(): Promise<CandidateEntity[]> {
        const query = `
            SELECT *
            FROM candidates
        `;

        return db.query(query);
    }

    async getByPesel(pesel: string): Promise<CandidateEntity | null> {
        const query = `
            SELECT * FROM candidates
            WHERE pesel = $1
            LIMIT 1
        `;
        return db.oneOrNone(query, [pesel]);
    }

    async getAllByUser(userId: number): Promise<CandidateEntity[]> {
        const query = `
            SELECT * FROM candidates
            WHERE user_id = $1
        `

        return db.query(query, [userId]);
    }

    async getLastUpdatedByUser(userId: number): Promise<CandidateEntity | null> {
        const query = `
            SELECT * FROM candidates
            WHERE user_id = $1
            ORDER BY updated_at DESC
            LIMIT 1;
        `;
        return db.oneOrNone(query, [userId]);
    }

    async insert(newCandidate: CandidateEntity): Promise<CandidateEntity> {
        const query = `
            INSERT INTO candidates (first_name, last_name, pesel, user_id)
            VALUES ($1, $2, $3, $4)
            RETURNING id;
        `;

        const values = [newCandidate.firstName, newCandidate.lastName, newCandidate.pesel, newCandidate.userId];
        return db.one(query, values);
    }
}
