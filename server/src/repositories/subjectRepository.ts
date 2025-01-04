import {db} from '../db';
import {SubjectEntity} from "../models/subjectEntity";

export class SubjectRepository {
    async getAll(): Promise<SubjectEntity[]> {
        const query = `
            SELECT * 
            FROM subjects
        `;

        return await db.query(query) || [];
    }

    async getById(id: number): Promise<SubjectEntity | null> {
        const query = `
            SELECT * 
            FROM subjects
            WHERE id = $1
            LIMIT 1
        `;

        return await db.oneOrNone(query, [id]);
    }
}