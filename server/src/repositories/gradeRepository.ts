import {db, ITask} from '../db';
import {GradeEntity} from "../models/gradeEntity";

export class GradeRepository {

    async getAllByCandidate(candidateId: number): Promise<GradeEntity[]> {
        const query = `
            SELECT * 
            FROM grades
            WHERE candidate_id = $1
        `;

        return await db.query(query, [candidateId]);
    }

    async getByCandidateSubjectType(candidateId: number, subjectId: number, type: string): Promise<GradeEntity | null> {
        const query = `
            SELECT * 
            FROM grades
            WHERE candidate_id = $1 AND subject_id = $2 AND type = $3
            LIMIT 1
        `;

        return await db.oneOrNone(query, [candidateId, subjectId, type]);
    }

    async getByCandidate(candidateId: number): Promise<GradeEntity | null> {
        const query = `
            SELECT * 
            FROM grades
            WHERE candidate_id = $1
            LIMIT 1
        `;

        return await db.oneOrNone(query, [candidateId]);
    }


    async insert(grade: GradeEntity, t: ITask<any>): Promise<void> {
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