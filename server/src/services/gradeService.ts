import {GradeRepository} from "../repositories/gradeRepository";
import {DataConflictError} from "../errors/dataConflictError";
import {ITask} from "pg-promise";
import {GradeSubmission} from "../types/gradeSubmission";
import {Grade} from "../models/gradeModel";

export class GradeService {
    constructor(
        private gradeRepository: GradeRepository,
        private readonly tx: (callback: (t: ITask<any>) => Promise<void>) => Promise<void>) {
        this.gradeRepository = gradeRepository;
    }

    async submitGrades(submissions: GradeSubmission[], candidateId: number): Promise<void> {
        await this.tx(async t => {
            for (const submission of submissions) {
                const existingGrade = await this.gradeRepository.getByCandidateIdSubjectIdType(
                    candidateId,
                    submission.subjectId,
                    submission.type
                );
                if (existingGrade.length > 0) throw new DataConflictError('Grade already exists');

                const newGrade: Grade = {
                    candidateId: candidateId,
                    subjectId: submission.subjectId,
                    grade: submission.grade,
                    type: submission.type,
                };

                await this.gradeRepository.insert(newGrade, t);
            }
        });
    }
}