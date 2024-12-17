import {db, ITask} from '../db';
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

    async insert(newSchool: SchoolEntity, t: ITask<any>): Promise<void> {
        const query = `
            INSERT INTO schools (name)
            VALUES ($1)
        `;
        const values = [newSchool.name];

        await t.none(query, values);
    }

    async update(school: SchoolEntity, t: ITask<any>): Promise<void> {
        const query = `
            UPDATE schools
            SET name = $2
            WHERE id = $1
        `;
        const values = [school.id, school.name];

        await t.none(query, values);
    }

    async delete(id: number, t: ITask<any>): Promise<void> {
        const query = `
            DELETE
            FROM schools
            WHERE id = $1
        `;
        const values = [id];

        await t.none(query, values);
    }
}