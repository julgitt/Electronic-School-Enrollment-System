import {db, ITask} from '../db';
import {Grade} from '../models/gradeModel';

export class GradeRepository {
    async getByCandidateIdAndSubjectId(candidateId: number, subjectId: number): Promise<Grade[]> {
        const query = `
            SELECT * 
            FROM grades
            WHERE candidate_id = $1 AND subject_id = $2
        `;

        return await db.query(query, [candidateId, subjectId]);
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