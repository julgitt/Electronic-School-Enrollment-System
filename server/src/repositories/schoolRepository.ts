import {db} from '../db';
import {SchoolEntity} from "../models/schoolEntity";

export class SchoolRepository {
    async getById(id: number): Promise<SchoolEntity | null> {
        const query = `
            SELECT *
            FROM schools 
            WHERE id = $1
            LIMIT 1
        `;

        return await db.oneOrNone(query, [id]);
    }

    async getAll(): Promise<SchoolEntity[]> {
        const query = `
            SELECT id, name 
            FROM schools;
        `;

        return await db.query<SchoolEntity[]>(query);
    }

    async insert(newSchool: SchoolEntity): Promise<void> {
        const query = `
            INSERT INTO schools (name, type)
            VALUES ($1, $2)
        `;
        const values = [newSchool.name];

        await db.query(query, values);
    }
}