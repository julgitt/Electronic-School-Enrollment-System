import { School } from '../models/schoolModel';
import { db } from '../db';

export class SchoolRepository {
    constructor() {}
    async getAllSchools(): Promise<School[]> {
        const query = `
            SELECT * FROM schools;
        `;

        const result = await db.query(query);
        return result.rows;
    }

    async insertSchool(newSchool: School): Promise<School> {
        const query = `
            INSERT INTO schools (name, enrollmentLimit) 
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const values = [newSchool.name, newSchool.enrollmentLimit];

        const result = await db.query(query, values);
        return result.rows[0] as School;
    }
}
