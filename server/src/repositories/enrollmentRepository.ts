import {db, ITask} from '../db';
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

    async endCurrent(): Promise<void> {
        const currentDate = new Date();
        const prevDate = new Date();
        prevDate.setDate(prevDate.getDate() - 1);
        const query = `
            UPDATE enrollments
            SET end_date = $2
            WHERE start_date <= $1 AND end_date >= $1
        `;
        await db.query(query, [currentDate, prevDate]);
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

    async getAll(): Promise<EnrollmentEntity[]> {
        const query = `
            SELECT *
            FROM enrollments
        `;
        return await db.query(query);
    }

    async insert(newEnrollment: EnrollmentEntity, t: ITask<any>): Promise<void> {
        const query = `
            INSERT INTO enrollments (round, start_date, end_date)
            VALUES ($1, $2, $3)
        `;
        const values = [newEnrollment.round, newEnrollment.startDate, newEnrollment.endDate];

        await t.none(query, values);
    }

    async update(enrollment: EnrollmentEntity, t: ITask<any>): Promise<void> {
        const query = `
            UPDATE enrollments
            SET round      = $2,
                start_date = $3,
                end_date   = $4
            WHERE id = $1
        `;
        const values = [enrollment.id, enrollment.round, enrollment.startDate, enrollment.endDate];

        await t.none(query, values);
    }

    async delete(id: number, t: ITask<any>): Promise<void> {
        const query = `
            DELETE
            FROM enrollments
            WHERE id = $1
        `;
        const values = [id];

        await t.none(query, values);
    }
}
