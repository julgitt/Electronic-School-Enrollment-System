import { db } from '../db';
import { Profile } from '../models/profileModel';

export class ProfileRepository {
    async getById(id: number): Promise<Profile | null> {
        const query = `
            SELECT * 
            FROM profiles
            WHERE id = $1
            LIMIT 1
        `;

        return await db.oneOrNone(query, [id]);
    }

    async getAllBySchool(schoolId: number): Promise<Profile[]> {
        const query = `
            SELECT *
            FROM profiles
            WHERE school_Id = $1;
        `;

        return await db.query<Profile[]>(query, [schoolId]);
    }
}