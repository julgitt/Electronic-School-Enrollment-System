import assert from 'assert';
import {afterEach} from 'mocha';
import sinon from 'sinon';

import {GradeService} from "../../../src/services/gradeService";
import {GradeRepository} from "../../../src/repositories/gradeRepository";
import {ITask} from "pg-promise";
import {SubjectService} from "../../../src/services/subjectService";
import {GradeEntity} from "../../../src/models/gradeEntity";
import {Subject} from "../../../src/dto/subject";
import {GradeRequest} from "../../../src/dto/grade/gradeRequest";
import {ValidationError} from "../../../src/errors/validationError";
import {DataConflictError} from "../../../src/errors/dataConflictError";
import {GradeType} from "../../../src/dto/grade/gradeType";
import {EnrollmentService} from "../../../src/services/enrollmentService";
import {Enrollment} from "../../../src/dto/enrollment";

describe('GradeService', () => {
    let gradeService: GradeService;
    let gradeRepoStub: sinon.SinonStubbedInstance<GradeRepository>;
    let subjectServiceStub: sinon.SinonStubbedInstance<SubjectService>;
    let enrollmentServiceStub: sinon.SinonStubbedInstance<EnrollmentService>;
    let txStub: sinon.SinonStub;

    beforeEach(() => {
        gradeRepoStub = sinon.createStubInstance(GradeRepository);
        subjectServiceStub = sinon.createStubInstance(SubjectService);
        enrollmentServiceStub = sinon.createStubInstance(EnrollmentService);
        txStub = sinon.stub().callsFake(async (callback: (t: ITask<any>) => Promise<void>) => {
            await callback({} as unknown as ITask<any>);
        })

        gradeService = new GradeService(gradeRepoStub, subjectServiceStub, enrollmentServiceStub, txStub);
    });

    afterEach(() => {
        sinon.restore();
    })

    describe('getAllByCandidate', () => {
        it('should return grades for the candidate', async () => {
            const mockGrades: GradeEntity[] = [
                {candidateId: 1, subjectId: 1, grade: 5, type: GradeType.Certificate},
                {candidateId: 1, subjectId: 2, grade: 4, type: GradeType.Certificate}
            ];
            gradeRepoStub.getAllByCandidate.resolves(mockGrades)

            const result = await gradeService.getAllByCandidate(1);

            assert.equal(gradeRepoStub.getAllByCandidate.callCount, 1);
            assert.deepStrictEqual(result, mockGrades);
        });
    });

    describe('checkIfGradesSubmitted', () => {
        it('should return true if grades are already submitted', async () => {
            gradeRepoStub.getByCandidate.resolves(
                {candidateId: 1, subjectId: 1, grade: 5, type: GradeType.Certificate}
            );

            const result = await gradeService.checkIfGradesSubmitted(1);

            assert.equal(result, true);
            assert.equal(gradeRepoStub.getByCandidate.callCount, 1);
        });

        it('should return false if no grades are submitted yet', async () => {
            gradeRepoStub.getByCandidate.resolves(null);

            const result = await gradeService.checkIfGradesSubmitted(1);

            assert.equal(result, false);
            assert.equal(gradeRepoStub.getByCandidate.callCount, 1);
        });
    });


    describe('submitGrades', () => {
        it('should submit grades successfully when data is valid', async () => {
            const mockSubjects: Subject[] = [
                {id: 1, name: "matematyka", isExamSubject: true},
                {id: 2, name: "historia", isExamSubject: false},
            ];
            const mockSubmissions: GradeRequest[] = [
                {subjectId: 1, grade: 5, type: GradeType.Certificate},
                {subjectId: 1, grade: 50, type: GradeType.Exam},
                {subjectId: 2, grade: 4, type: GradeType.Certificate}
            ];

            subjectServiceStub.getAllSubjects.resolves(mockSubjects);
            enrollmentServiceStub.getCurrentEnrollment.resolves({} as Enrollment);
            gradeRepoStub.getByCandidateSubjectType.resolves(null);
            gradeRepoStub.insert.resolves();

            await gradeService.submitGrades(mockSubmissions, 1);

            assert.equal(gradeRepoStub.insert.callCount, 3);
            assert.equal(txStub.callCount, 1);
        });

        it('should throw ValidationError if the number of grades is incorrect', async () => {
            const mockSubjects: Subject[] = [
                {id: 1, name: "matematyka", isExamSubject: true},
                {id: 2, name: "historia", isExamSubject: false},
            ];
            const mockSubmissions: GradeRequest[] = [
                {subjectId: 1, grade: 50, type: GradeType.Exam},
                {subjectId: 2, grade: 4, type: GradeType.Certificate}
            ];

            subjectServiceStub.getAllSubjects.resolves(mockSubjects);
            enrollmentServiceStub.getCurrentEnrollment.resolves({} as Enrollment);


            await assert.rejects(
                () => gradeService.submitGrades(mockSubmissions, 1),
                (err) => err instanceof ValidationError && err.message === 'Błędna ilość ocen.'
            );
        });

        it('should throw ValidationError if certificate grade for an subject is missing', async () => {
            const mockSubjects: Subject[] = [
                {id: 1, name: "matematyka", isExamSubject: true},
                {id: 2, name: "historia", isExamSubject: false},
            ];
            const mockSubmissions: GradeRequest[] = [
                {subjectId: 1, grade: 50, type: GradeType.Exam},
                {subjectId: 1, grade: 5, type: GradeType.Certificate},
                {subjectId: 2, grade: 4, type: GradeType.Exam}
            ];

            subjectServiceStub.getAllSubjects.resolves(mockSubjects);
            enrollmentServiceStub.getCurrentEnrollment.resolves({} as Enrollment);

            await assert.rejects(
                () => gradeService.submitGrades(mockSubmissions, 1),
                (err) => err instanceof ValidationError && err.message === 'Brak oceny dla przedmiotu: 2: historia.'
            );
        });

        it('should throw ValidationError if exam grade for a subject is missing', async () => {
            const mockSubjects: Subject[] = [
                {id: 1, name: "matematyka", isExamSubject: true},
                {id: 2, name: "historia", isExamSubject: false},
            ];
            const mockSubmissions: GradeRequest[] = [
                {subjectId: 1, grade: 50, type: GradeType.Certificate},
                {subjectId: 4, grade: 4, type: GradeType.Certificate},
                {subjectId: 2, grade: 4, type: GradeType.Certificate}
            ];

            subjectServiceStub.getAllSubjects.resolves(mockSubjects);
            enrollmentServiceStub.getCurrentEnrollment.resolves({} as Enrollment);

            await assert.rejects(
                () => gradeService.submitGrades(mockSubmissions, 1),
                (err) => err instanceof ValidationError && err.message === 'Brak oceny dla przedmiotu: 1: matematyka.'
            );
        });

        it('should throw DataConflictError if grade already exists', async () => {
            const mockSubjects: Subject[] = [
                {id: 1, name: "matematyka", isExamSubject: false},
                {id: 2, name: "historia", isExamSubject: false},
            ];
            const mockSubmissions: GradeRequest[] = [
                {subjectId: 1, grade: 5, type: GradeType.Certificate},
                {subjectId: 2, grade: 4, type: GradeType.Certificate}
            ];

            const existingGrade: GradeEntity = {
                candidateId: 1, subjectId: 1, grade: 3, type: GradeType.Certificate
            };

            subjectServiceStub.getAllSubjects.resolves(mockSubjects);
            gradeRepoStub.getByCandidateSubjectType.resolves(existingGrade);
            enrollmentServiceStub.getCurrentEnrollment.resolves({} as Enrollment);

            await assert.rejects(
                () => gradeService.submitGrades(mockSubmissions, 1),
                (err) => err instanceof DataConflictError && err.message === 'Ocena już istnieje'
            );
        });
    });

})
