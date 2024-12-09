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
}