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

    /**
     *  Pobiera wszystkie oceny dla podanego kandydata.
     *
     * @param {number} candidateId - identyfikator kandydata.
     * @returns {Promise<Profile>} Zwraca obiekt oceny, zawierający:
     *
     *  - grade: wartość oceny
     *  - subjectId: identyfikator przedmiotu, z którego jest ocena
     *  - type: typ oceny - czy jest to ocena ze świadectwa czy z egzaminu
     */
    async getAllByCandidate(candidateId: number): Promise<Grade[]> {
        return this.gradeRepository.getAllByCandidate(candidateId);
    }

    /**
     *  Zwraca informację, czy kandydat już podał swoje oceny.
     *
     * @param {number} candidateId - identyfikator kandydata.
     * @returns {Promise<boolean>} Zwraca wartość false - jeśli kandydat nie podawał ocen, wpp true
     */
    async checkIfGradesSubmitted(candidateId: number): Promise<boolean> {
        return !!(await this.gradeRepository.getByCandidate(candidateId));
    }

    /**
     *  Dodaje oceny do bazy danych dla danego kandydata.
     *
     * @param {GradeRequest} submissions - tablica ocen uzyskanych przez kadnydata. Każdy obiekt zawiera:
     *
     * - subjectId - identyfikator przedmiotu
     * - grade - wartość oceny
     * - type - typ oceny (czy jest ze świadectwa czy z egzaminu)
     * @param {number} candidateId - identyfikator kandydata.
     * @returns {Promise<void>}
     *
     * @throws {ValidationError} Jeśli kandydat próbuje złożyć oceny poza okresem naboru
     * @throws {DataConflictError} Jeśli oceny zostały już złożone przez kandydata
     */
    async submitGrades(submissions: GradeRequest[], candidateId: number): Promise<void> {
        const enrollment: Enrollment | null = await this.enrollmentService.getCurrentEnrollment();
        if (!enrollment) throw new ValidationError('Nie można złożyć aplikacji poza okresem naboru.');

        if (await this.checkIfGradesSubmitted(candidateId)) throw new DataConflictError("Oceny już zostały złożone.")

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