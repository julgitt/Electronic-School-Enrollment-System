import assert from 'assert';
import {afterEach} from 'mocha';
import sinon from 'sinon';

import {CandidateService} from "../../../src/services/candidateService";
import {CandidateRepository} from "../../../src/repositories/candidateRepository";
import {ResourceNotFoundError} from "../../../src/errors/resourceNotFoundError";
import {DataConflictError} from "../../../src/errors/dataConflictError";
import {CandidateEntity} from "../../../src/models/candidateEntity";
import {CandidateRequest} from "../../../src/dto/candidate/candidateRequest";
import {GradeService} from "../../../src/services/gradeService";
import {Grade} from "../../../src/dto/grade/grade";


describe('CandidateService', () => {
    let candidateService: CandidateService;
    let candidateRepoStub: sinon.SinonStubbedInstance<CandidateRepository>;
    let gradeServiceStub: sinon.SinonStubbedInstance<GradeService>;

    beforeEach(() => {
        candidateRepoStub = sinon.createStubInstance(CandidateRepository);
        gradeServiceStub = sinon.createStubInstance(GradeService);
        candidateService = new CandidateService(candidateRepoStub, gradeServiceStub);
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('getLastCreatedCandidateByUser', () => {
        it('should return the last created candidate for a given user', async () => {
            const candidate = {
                id: 1, userId: 1, firstName: 'Jan', lastName: 'Kowalski', pesel: '12345678901'
            };
            candidateRepoStub.getLastUpdatedByUser.resolves(candidate);

            const result = await candidateService.getLastCreatedCandidateByUser(1);
            assert.equal(result, candidate);
            assert.equal(candidateRepoStub.getLastUpdatedByUser.callCount, 1);
        });
    });

    describe('getAllByUser', () => {
        it('should return all candidates for a given user', async () => {
            const mockCandidates: CandidateEntity[] = [
                {id: 1, userId: 1, firstName: 'Jan', lastName: 'Kowalski', pesel: '12345678901'},
                {id: 2, userId: 1, firstName: 'Agata', lastName: 'Nowak', pesel: '12345678902'},
            ];
            candidateRepoStub.getAllByUser.resolves(mockCandidates);

            const result = await candidateService.getAllByUser(1);
            assert.deepEqual(result, mockCandidates);
            assert.equal(candidateRepoStub.getAllByUser.callCount, 1);
        });
    });

    describe('getAllWithGrades', () => {
        it('should return all candidates with grades', async () => {
            const mockCandidates: CandidateEntity[] = [
                {id: 1} as CandidateEntity,
                {id: 2} as CandidateEntity,
            ];
            gradeServiceStub.getAllByCandidate.callsFake(((candidateId: number) => {
                return Promise.resolve([{grade: candidateId}] as Grade[])
            }));
            candidateRepoStub.getAll.resolves(mockCandidates);

            const result = await candidateService.getAllWithGrades();
            assert.deepEqual(result, [
                {candidate: {id: 1}, grades: [{grade: 1}]},
                {candidate: {id: 2}, grades: [{grade: 2}]}
            ]);
            assert.equal(candidateRepoStub.getAll.callCount, 1);
            assert.equal(gradeServiceStub.getAllByCandidate.callCount, 2);
        });
    });

    describe('getCandidate', () => {
        it('should return the candidate if found and the userId matches', async () => {
            const candidate = {
                id: 1, userId: 1, firstName: 'Jan', lastName: 'Kowalski', pesel: '12345678901'
            };
            candidateRepoStub.getById.resolves(candidate);

            const result = await candidateService.getCandidate(1, 1);
            assert.deepEqual(result, candidate);
            assert.equal(candidateRepoStub.getById.callCount, 1);
        });

        it('should throw ResourceNotFoundError if the candidate does not exist', async () => {
            candidateRepoStub.getById.resolves(null);

            await assert.rejects(
                () => candidateService.getCandidate(1, 1),
                (err) => err instanceof ResourceNotFoundError && err.message === 'Nie znaleziono kandydata.'
            );
        });

        it('should throw ResourceNotFoundError if the candidate is not related to logged in user', async () => {
            const candidate = {
                id: 1,
                userId: 2,
                firstName: 'Jan',
                lastName: 'Kowalski',
                pesel: '23456789012'
            };
            candidateRepoStub.getById.resolves(candidate);

            await assert.rejects(
                () => candidateService.getCandidate(1, 1),
                (err) => err instanceof ResourceNotFoundError && err.message === 'Nie znaleziono kandydata.'
            );
        });
    });

    describe('getCandidateById', () => {
        it('should return the candidate if exists', async () => {
            const candidate = {
                id: 1, userId: 1, firstName: 'Jan', lastName: 'Kowalski', pesel: '12345678901'
            };
            candidateRepoStub.getById.resolves(candidate);

            const result = await candidateService.getCandidateById(1);
            assert.deepEqual(result, candidate);
            assert.equal(candidateRepoStub.getById.callCount, 1);
        });

        it('should throw ResourceNotFoundError if the candidate by id does not exist', async () => {
            candidateRepoStub.getById.resolves(null);

            await assert.rejects(
                () => candidateService.getCandidateById(1),
                (err) => err instanceof ResourceNotFoundError && err.message === "Nie znaleziono kandydata."
            )
        });
    });

    describe('deleteCandidate', () => {
        it('should delete candidate if it exists and belongs to the user', async () => {
            const mockCandidate: CandidateEntity = {
                id: 1,
                userId: 1,
                firstName: 'Agata',
                lastName: 'Nowak',
                pesel: '12345678901'
            };
            candidateRepoStub.getById.resolves(mockCandidate);
            candidateRepoStub.deleteById.resolves();

            await candidateService.deleteCandidate(1, 1);
            assert(candidateRepoStub.deleteById.calledOnceWith(1));
        });
    });

    describe('register', () => {
        it('should register a new candidate', async () => {
            const newCandidate: CandidateRequest = {
                firstName: 'Jan',
                lastName: 'Kowalski',
                pesel: '34567890123'
            };

            candidateRepoStub.getByPesel.resolves(null);
            candidateRepoStub.insert.resolves({...newCandidate, id: 1, userId: 2});

            const result = await candidateService.register(2, newCandidate);
            assert(candidateRepoStub.getByPesel.calledOnceWith('34567890123'));
            assert(candidateRepoStub.insert.calledOnceWith({...newCandidate, id: 0, userId: 2}));
            assert.equal(result.firstName, 'Jan');
            assert.equal(result.userId, 2);
        });

        it('should throw DataConflictError if a candidate with the same pesel already exists', async () => {
            const existingCandidate: CandidateEntity = {
                id: 1,
                userId: 1,
                firstName: 'Jan',
                lastName: 'Kowalski',
                pesel: '34567890123'
            };

            const newCandidate: CandidateRequest = {
                firstName: 'Jan2',
                lastName: 'Kowalski2',
                pesel: '34567890123'
            };

            candidateRepoStub.getByPesel.resolves(existingCandidate);

            try {
                await candidateService.register(2, newCandidate);
                assert.fail('Expected an error to be thrown');
            } catch (error) {
                assert(error instanceof DataConflictError);
                assert.equal(error.message, 'Już istnieje kandydat z tym numerem pesel.');
            }
        });
    });
});