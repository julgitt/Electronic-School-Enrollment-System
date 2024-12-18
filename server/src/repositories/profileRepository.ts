import {db} from '../db';
import {ProfileEntity} from "../models/profileEntity";
import {ProfileCriteriaEntity} from "../models/profileCriteriaEntity";

export class ProfileRepository {
    async getById(id: number): Promise<ProfileEntity | null> {
        const query = `
            SELECT * 
            FROM profiles
            WHERE id = $1
            LIMIT 1
        `;

        return await db.oneOrNone(query, [id]);
    }

    async getBySchool(schoolId: number): Promise<ProfileEntity | null> {
        const query = `
            SELECT *
            FROM profiles
            WHERE school_Id = $1
            LIMIT 1;
        `;

        return db.oneOrNone(query, [schoolId]);
    }

    async getAllBySchool(schoolId: number): Promise<ProfileEntity[]> {
        const query = `
            SELECT *
            FROM profiles
            WHERE school_Id = $1;
        `;

        return await db.query(query, [schoolId]);
    }

    async getAll(): Promise<ProfileEntity[]> {
        const query = `
            SELECT *
            FROM profiles
        `;

        return await db.query(query);
    }

    async getAllProfilesCriteria(): Promise<ProfileCriteriaEntity[]> {
        const query = `
            SELECT *
            FROM profile_criteria
        `;

        return await db.query(query);
    }
}