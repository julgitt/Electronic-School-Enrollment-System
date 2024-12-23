import {GradeRepository} from "../repositories/gradeRepository";
import {DataConflictError} from "../errors/dataConflictError";
import {ITask} from "pg-promise";
import {GradeRequest} from "../dto/grade/gradeRequest";
import {SubjectService} from "./subjectService";
import {ValidationError} from "../errors/validationError";
import {GradeEntity} from "../models/gradeEntity";
import {Grade} from "../dto/grade/grade";
import {Subject} from "../dto/subject";
import {GradeType} from "../dto/grade/gradeType";
import {transactionFunction} from "../db";
import {Enrollment} from "../dto/enrollment";
import {EnrollmentService} from "./enrollmentService";

export class GradeService {
    constructor(
        private gradeRepository: GradeRepository,
        private subjectService: SubjectService,
        private enrollmentService: EnrollmentService,
        private readonly tx: transactionFunction
    ) {
    }

    async getAllByCandidate(candidateId: number) {
        return this.gradeRepository.getAllByCandidate(candidateId);
    }

    async checkIfGradesSubmitted(candidateId: number): Promise<boolean> {
        return !!(await this.gradeRepository.getByCandidate(candidateId));
    }

    async submitGrades(submissions: GradeRequest[], candidateId: number): Promise<void> {
        const enrollment: Enrollment | null = await this.enrollmentService.getCurrentEnrollment();
        if (!enrollment) throw new ValidationError('Nie można złożyć aplikacji poza okresem naboru.');

        await this.tx(async t => {
            const subjects = await this.subjectService.getAllSubjects();
            const examSubjects = subjects.filter(s => s.isExamSubject);

            this.validateGradeCount(submissions.length, subjects.length, examSubjects.length);
            this.validateGradeSubjects(submissions, subjects)

            for (const submission of submissions) {
                await this.checkIfGradeExists(submission, candidateId);
                await this.insertGrade(submission, candidateId, t)
            }
        });
    }

    private validateGradeCount(submissionCount: number, subjectCount: number, examSubjectCount: number) {
        const requiredCount = subjectCount + examSubjectCount;
        if (submissionCount !== requiredCount) {
            throw new ValidationError("Błędna ilość ocen.");
        }
    }

    private validateGradeSubjects(submissions: GradeRequest[], subjects: Subject[]) {
        for (const subject of subjects) {
            const hasCertificateGrade = submissions.some(s => {
                const sameId = s.subjectId === subject.id;
                return sameId && s.type === GradeType.Certificate;
            });

            const hasExamGrade = submissions.some(s => {
                const sameId = s.subjectId === subject.id;
                return sameId && s.type === GradeType.Exam;
            });

            if (!hasCertificateGrade || (subject.isExamSubject && !hasExamGrade)) {
                throw new ValidationError(`Brak oceny dla przedmiotu: ${subject.id}: ${subject.name}.`);
            }
        }
    }

    private async checkIfGradeExists(submission: GradeRequest, candidateId: number) {
        const existingGrade: Grade | null = await this.gradeRepository.getByCandidateSubjectType(
            candidateId,
            submission.subjectId,
            submission.type
        );
        if (existingGrade) throw new DataConflictError('Ocena już istnieje');
    }

    private async insertGrade(submission: GradeRequest, candidateId: number, t: ITask<any>) {
        const newGrade: GradeEntity = {
            candidateId: candidateId,
            subjectId: submission.subjectId,
            grade: submission.grade,
            type: submission.type,
        };
        await this.gradeRepository.insert(newGrade, t);
    }
}