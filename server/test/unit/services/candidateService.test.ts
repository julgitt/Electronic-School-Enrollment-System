import assert from 'assert';
import {afterEach} from 'mocha';
import sinon from 'sinon';

import {CandidateService} from "../../../src/services/candidateService";
import {CandidateRepository} from "../../../src/repositories/candidateRepository";
import {ResourceNotFoundError} from "../../../src/errors/resourceNotFoundError";
import {AuthorizationError} from "../../../src/errors/authorizationError";
import {DataConflictError} from "../../../src/errors/dataConflictError";
import {GradeService} from "../../../src/services/gradeService";


describe('CandidateService', () => {
    let candidateService: CandidateService;
    let candidateRepoStub: sinon.SinonStubbedInstance<CandidateRepository>;
    let gradeServiceStub: sinon.SinonStubbedInstance<GradeService>;

    beforeEach(() => {
        candidateRepoStub = sinon.createStubInstance(CandidateRepository);
        candidateService = new CandidateService(gradeServiceStub, candidateRepoStub);
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('getLastCreatedByUserId', () => {
        it('should return the last created candidate for a given user', async () => {
            const userId = 1;
            const candidate = {userId, firstName: 'Jan', lastName: 'Kowalski', pesel: '12345678901'};

            candidateRepoStub.getLastUpdatedByUserId.resolves(candidate);

            const result = await candidateService.getLastCreatedByUserId(userId);
            assert.equal(result, candidate);
            assert.equal(candidateRepoStub.getLastUpdatedByUserId.callCount, 1);
        });
    });

    describe('getByIdAndUser', () => {
        it('should return the candidate if found and the userId matches', async () => {
            const userId = 1;
            const id = 1;
            const candidate = {id, userId, firstName: 'Jan', lastName: 'Kowalski', pesel: '23456789012'};

            candidateRepoStub.getById.resolves(candidate);

            const result = await candidateService.getCandidate(id, userId);
            assert.equal(result, candidate);
            assert.equal(candidateRepoStub.getById.callCount, 1);
        });

        it('should throw ResourceNotFoundError if the candidate does not exist', async () => {
            const id = 1;
            const userId = 1;

            candidateRepoStub.getById.resolves(null);

            try {
                await candidateService.getCandidate(id, userId)
                assert.fail('Expected an error to be thrown');
            } catch (err) {
                assert(err instanceof ResourceNotFoundError);
                assert.equal((err as Error).message, 'Candidate not found.')
            }
        });

        it('should throw AuthorizationError if the candidate is not related to logged in user', async () => {
            const id = 1;
            const userId = 1;
            const candidate = {
                id,
                userId: 2,
                firstName: 'Jan',
                lastName: 'Kowalski',
                pesel: '23456789012'
            };

            candidateRepoStub.getById.resolves(candidate);

            try {
                await candidateService.getCandidate(id, userId);
                assert.fail('Expected an error to be thrown');
            } catch (err) {
                assert(err instanceof AuthorizationError);
            }
        });
    });

    describe('register', () => {
        it('should create a new candidate if the pesel is unique', async () => {
            const userId = 1;
            const firstName = 'Jan';
            const lastName = 'Kowalski';
            const pesel = '34567890123';

            candidateRepoStub.getByPesel.resolves(null);

            const newCandidate = {userId, firstName, lastName, pesel};
            candidateRepoStub.insert.resolves(newCandidate);

            const result = await candidateService.register(userId, firstName, lastName, pesel);
            assert.deepStrictEqual(result, newCandidate);
            assert(candidateRepoStub.getByPesel.calledOnceWith(pesel));
            assert(candidateRepoStub.insert.calledOnceWith(newCandidate));
        });

        it('should throw DataConflictError if a candidate with the same pesel already exists', async () => {
            const userId = 1;
            const firstName = 'Jan';
            const lastName = 'Kowalski';
            const pesel = '34567890123';

            const existingCandidate = {userId, firstName, lastName, pesel};
            candidateRepoStub.getByPesel.resolves(existingCandidate);

            try {
                await candidateService.register(userId, firstName, lastName, pesel);
                assert.fail('Expected an error to be thrown');
            } catch (error) {
                assert(error instanceof DataConflictError);
                assert.strictEqual(error.message, 'There is already candidate with that pesel.');
            }
        });
    });
});
