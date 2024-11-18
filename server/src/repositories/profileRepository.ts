import { db } from '../db';
import { Profile } from '../models/profileModel';

export class ProfileRepository {
    async getById(id: number): Promise<Profile | null> {
        const query = `
            SELECT * 
            FROM profiles
            WHERE id = $1
        `;

        return await db.oneOrNone(query, [id]);
    }

 /*   async getAllBySchool(): Promise<School[]> {
        const query = `
            SELECT id, name, enrollment_limit 
            FROM profiles;
        `;

        return await db.query<School[]>(query);
    }*/
}