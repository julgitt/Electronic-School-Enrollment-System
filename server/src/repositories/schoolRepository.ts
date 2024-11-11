import { db } from '../db';
import { School } from '../models/schoolModel';

export class SchoolRepository {
    async getById(id: number): Promise<School | null> {
        const query = `
            SELECT * 
            FROM schools 
            WHERE id = $1
        `;

        return await db.oneOrNone(query, [id]);
    }

    async getAll(): Promise<School[]> {
        const query = `
            SELECT id, name, enrollment_limit 
            FROM schools;
        `;

        return await db.query<School[]>(query);
    }

    async insert(newSchool: Omit<School, 'id'>): Promise<void> {
        const query = `
            INSERT INTO schools (name, enrollment_limit) 
            VALUES ($1, $2)
        `;
        const values = [newSchool.name, newSchool.enrollmentLimit];

        await db.query(query, values);
    }
}