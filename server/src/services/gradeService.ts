import {GradeRepository} from "../repositories/gradeRepository";
import {DataConflictError} from "../errors/dataConflictError";
import {ITask} from "pg-promise";
import {GradeRequest} from "../dto/gradeRequest";
import {SubjectService} from "./subjectService";
import {ValidationError} from "../errors/validationError";
import {GradeEntity} from "../models/gradeEntity";
import {Grade} from "../dto/grade";

export class GradeService {
    constructor(
        private gradeRepository: GradeRepository,
        private subjectService: SubjectService,
        private readonly tx: (callback: (t: ITask<any>) => Promise<void>) => Promise<void>) {
    }

    async getAllByCandidate(candidateId: number) {
        return this.gradeRepository.getAllByCandidate(candidateId);
    }

    async submitGrades(submissions: GradeRequest[], candidateId: number): Promise<void> {
        await this.tx(async t => {
            const subjects = await this.subjectService.getAllSubjects();
            const examSubjects = subjects.filter(s => s.isExamSubject);
            if (submissions.length !== subjects.length + examSubjects.length)
                throw new ValidationError("Wrong number of grades.");

            for (const submission of submissions) {
                const isInvalidSubject = !subjects.some(
                    s => s.id === submission.subjectId && (!s.isExamSubject || submission.type === "exam")
                );
                if (isInvalidSubject) throw new ValidationError("Wrong grades subject.");

                const existingGrade: Grade | null = await this.gradeRepository.getByCandidateSubjectType(
                    candidateId,
                    submission.subjectId,
                    submission.type
                );

                if (existingGrade) throw new DataConflictError('GradeRequest already exists');

                const newGrade: GradeEntity = {
                    candidateId: candidateId,
                    subjectId: submission.subjectId,
                    grade: submission.grade,
                    type: submission.type,
                };

                await this.gradeRepository.insert(newGrade, t);
            }
        });
    }

    async checkIfGradesSubmitted(candidateId: number): Promise<boolean> {
        return !!(await this.gradeRepository.getByCandidate(candidateId));
    }
}