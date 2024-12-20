import {db} from '../db';
import {ProfileEntity} from "../models/profileEntity";
import {ProfileCriteriaEntity} from "../models/profileCriteriaEntity";
import {ITask} from "pg-promise";

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

    async getProfileCriteria(profileId: number): Promise<ProfileCriteriaEntity[]> {
        const query = `
            SELECT *
            FROM profile_criteria
            WHERE profile_id = $1
        `;

        return await db.query(query, [profileId]);
    }

    async getProfileCapacity(profileId: number): Promise<number | null> {
        const query = `
            SELECT capacity
            FROM profiles
            WHERE id = $1
            LIMIT 1
        `;

        return (await db.oneOrNone(query, [profileId])).capacity;
    }

    async insert(profile: ProfileEntity, t: ITask<any>): Promise<ProfileEntity> {
        const query = `
            INSERT INTO profiles (name, school_id, capacity)
            VALUES ($1, $2, $3)
            RETURNING *
        `;

        return await t.one(query, [profile.name, profile.schoolId, profile.capacity]);
    }

    async insertCriteria(criteria: ProfileCriteriaEntity, t: ITask<any>): Promise<void> {
        const query = `
            INSERT INTO profile_criteria (profile_id, subject_id, type)
            VALUES ($1, $2, $3)
        `;

        await t.none(query, [criteria.profileId, criteria.subjectId, criteria.type]);
    }

    async update(profile: ProfileEntity, t: ITask<any>): Promise<void> {
        const query = `
            UPDATE profiles
            SET 
                name = $2,
                capacity = $3
            WHERE id = $1
        `;

        await t.none(query, [profile.id, profile.name, profile.capacity]);
    }

    async deleteCriteriaByProfile(profileId: number, t: ITask<any>): Promise<void> {
        const query = `
            DELETE
            FROM profile_criteria
            WHERE profile_id = $1
        `;

        await t.none(query, [profileId]);
    }

    async delete(profileId: number, schoolId: number): Promise<void> {
        const query = `
            DELETE
            FROM profiles
            WHERE id = $1
              AND school_Id = $2
        `;

        await db.none(query, [profileId, schoolId]);
    }
}