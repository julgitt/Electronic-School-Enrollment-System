import {db} from '../db';
import {Subject} from "../entities/subjectModel";

export class SubjectRepository {
    async getAll(): Promise<Subject[]> {
        const query = `
            SELECT * 
            FROM subjects
        `;

        return await db.query(query) || [];
    }
}