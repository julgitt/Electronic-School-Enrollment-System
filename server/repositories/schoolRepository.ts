import { School } from '../models/schoolModel';
import { db } from '../db';

export class SchoolRepository {
    constructor() {}
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
