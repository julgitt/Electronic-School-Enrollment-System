import { db } from '../db';
import { School } from '../models/schoolModel';

export class SchoolRepository {
    async getById(id: number): Promise<School | null> {
        const query = `
            SELECT
            FROM schools 
            WHERE id = $1
        `;

        return await db.oneOrNone(query, [id]);
    }

    async getAll(): Promise<School[]> {
        const query = `
            SELECT id, name 
            FROM schools;
        `;

        return await db.query<School[]>(query);
    }

    async insert(newSchool: School): Promise<void> {
        const query = `
            INSERT INTO schools (name, type) 
            VALUES ($1, $2)
        `;
        const values = [newSchool.name];

        await db.query(query, values);
    }
}