import { db } from '../db';
import {Candidate} from "../models/candidateModel";

export class CandidateRepository {
    async getById(id: number): Promise<Candidate | null> {
        const query = `
            SELECT * FROM candidates
            WHERE id = $1
            LIMIT 1
        `;
        return await db.oneOrNone(query, [id]);
    }

    async getAll(): Promise<Candidate[]> {
        const query = `
            SELECT *
            FROM candidates
        `;

        return await db.query(query);
    }

    async getByPesel(pesel: string): Promise<Candidate | null> {
        const query = `
            SELECT * FROM candidates
            WHERE pesel = $1
            LIMIT 1
        `;
        return await db.oneOrNone(query, [pesel]);
    }

    async getAllByUser(userId: number): Promise<Candidate[]> {
        const query = `
            SELECT * FROM candidates
            WHERE user_id = $1
        `

        return await db.query(query, [userId]);
    }

    async getLastUpdatedByUser(userId: number): Promise<Candidate | null> {
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
