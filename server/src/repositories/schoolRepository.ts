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
            INSERT INTO schools (name)
            VALUES ($1)
        `;
        const values = [newSchool.name];

        await db.query(query, values);
    }


    async update(id: number, name: string): Promise<void> {
        const query = `
            UPDATE schools
            SET name = $2
            WHERE id = $1
        `;
        const values = [id, name];

        await db.query(query, values);
    }

    async delete(id: number): Promise<void> {
        const query = `
            DELETE FROM schools
            WHERE id = $1
        `;
        const values = [id];

        await db.query(query, values);
    }
}