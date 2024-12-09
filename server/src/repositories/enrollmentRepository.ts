import {db} from '../db';
import {EnrollmentEntity} from "../models/enrollmentEntity";

export class EnrollmentRepository {

    async getById(id: number): Promise<EnrollmentEntity | null> {
        const query = `
            SELECT * 
            FROM enrollments 
            WHERE id = $1
            LIMIT 1
        `;
        return await db.oneOrNone(query, [id]);
    }

    async getCurrent(): Promise<EnrollmentEntity | null> {
        const date = new Date();
        const query = `
            SELECT *
            FROM enrollments
            WHERE start_date <= $1 AND end_date >= $1
            LIMIT 1
        `;
        return await db.oneOrNone(query, [date]);
    }

    async getAllFromCurrentYear(): Promise<EnrollmentEntity[]> {
        const year: number = new Date().getFullYear();
        const query = `
            SELECT *
            FROM enrollments
            WHERE date_part('year', end_date) = $1
        `;
        return await db.query(query, [year]);
    }
}
