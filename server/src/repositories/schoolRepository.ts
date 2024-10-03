import { School } from '../models/schoolModel';
import { db } from '../db';

export class SchoolRepository {
    constructor() {}

    async getSchoolById(id: number): Promise<School | null> {
        const query = 'SELECT * FROM schools WHERE id = $1';
        const result = await db.query(query, [id]);
        if (result.length === 0)
            return null;
        return result[0];
    }

    async getAllSchools(): Promise<School[]> {
        const query = `
            SELECT id, name, enrollment_limit FROM schools;
        `;

        return await db.query<School[]>(query);
    }

    async insertSchool(newSchool: Omit<School, 'id'>): Promise<School> {
        const query = `
            INSERT INTO schools (name, enrollment_limit) 
            VALUES ($1, $2)
            RETURNING *;
        `;
        const values = [newSchool.name, newSchool.enrollmentLimit];

        const result = await db.query(query, values);
        return result[0] as School;
    }
}
