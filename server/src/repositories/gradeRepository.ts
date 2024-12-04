import {db, ITask} from '../db';
import {Grade} from "../models/gradeModel";

export class GradeRepository {

    async getAllByCandidate(candidateId: number) {
        const query = `
            SELECT * 
            FROM grades
            WHERE candidate_id = $1
            LIMIT 1
        `;

        return await db.query(query, [candidateId]);
    }
    async getByCandidateSubjectType(candidateId: number, subjectId: number, type: string): Promise<Grade | null> {
        const query = `
            SELECT * 
            FROM grades
            WHERE candidate_id = $1 AND subject_id = $2 AND type = $3
            LIMIT 1
        `;

        return await db.oneOrNone(query, [candidateId, subjectId, type]);
    }

    async getByCandidate(candidateId: number): Promise<Grade | null> {
        const query = `
            SELECT * 
            FROM grades
            WHERE candidate_id = $1
            LIMIT 1
        `;

        return await db.oneOrNone(query, [candidateId]);
    }


    async insert(grade: Grade, t: ITask<any>): Promise<void> {
        const query = `
            INSERT INTO grades (candidate_id, subject_id, grade, type)
            VALUES ($1, $2, $3, $4)
        `;

        await t.none(
            query,
            [grade.candidateId, grade.subjectId, grade.grade, grade.type]
        );
    }
}