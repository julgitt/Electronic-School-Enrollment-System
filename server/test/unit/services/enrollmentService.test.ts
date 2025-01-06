import assert from 'assert';
import {afterEach} from 'mocha';
import sinon from 'sinon';

import {EnrollmentRepository} from "../../../src/repositories/enrollmentRepository";
import {EnrollmentService} from "../../../src/services/enrollmentService";
import {EnrollmentEntity} from "../../../src/models/enrollmentEntity";

describe('EnrollmentService', () => {
    let enrollmentService: EnrollmentService;
    let enrollmentRepoStub: sinon.SinonStubbedInstance<EnrollmentRepository>;
    let txStub: sinon.SinonStub;

    beforeEach(() => {
        enrollmentRepoStub = sinon.createStubInstance(EnrollmentRepository);
        txStub = sinon.stub().callsFake(async (callback) => {
            await callback({});
        })
        enrollmentService = new EnrollmentService(enrollmentRepoStub, txStub);
    });

    afterEach(() => {
        sinon.restore();
    })

    describe('getEnrollment', () => {
        it('should return enrollment when enrollment exists', async () => {
            const mockEnrollment: EnrollmentEntity = {
                id: 1,
                round: 1,
                startDate: new Date(),
                endDate: new Date()
            };

            enrollmentRepoStub.getById.resolves(mockEnrollment);

            const result = await enrollmentService.getEnrollment(1);

            assert.equal(enrollmentRepoStub.getById.callCount, 1);
            assert.equal(result, mockEnrollment);
        });

        it('should throw an error when enrollment does not exist', async () => {
            enrollmentRepoStub.getById.resolves(null);

            try {
                await enrollmentService.getEnrollment(1);
                assert.fail('Expected an error to be thrown');
            } catch (err) {
                assert.equal((err as Error).message, 'Nabór nie znaleziony.')
            }

            assert.equal(enrollmentRepoStub.getById.callCount, 1);
        });
    });

    describe('getCurrentEnrollment', () => {
        it('should return current enrollment', async () => {
            const mockEnrollment: EnrollmentEntity = {
                id: 1,
                round: 1,
                startDate: new Date(),
                endDate: new Date()
            };
            enrollmentRepoStub.getCurrent.resolves(mockEnrollment);

            const result = await enrollmentService.getCurrentEnrollment();

            assert.equal(enrollmentRepoStub.getCurrent.callCount, 1);
            assert.deepEqual(result, mockEnrollment);
        });

        it('should return null when outside enrollment period', async () => {
            enrollmentRepoStub.getCurrent.resolves(null);

            const result = await enrollmentService.getCurrentEnrollment();

            assert.equal(enrollmentRepoStub.getCurrent.callCount, 1);
            assert.equal(result, null);
        })
    });

    describe('getCurrentYearEnrollments', () => {
        it('should return enrollments from the current year', async () => {
            const mockEnrollments: EnrollmentEntity[] = [
                {id: 1, round: 1, startDate: new Date('2024-01-01'), endDate: new Date('2024-12-31')},
                {id: 2, round: 1, startDate: new Date('2024-01-01'), endDate: new Date('2024-12-31')}
            ];
            enrollmentRepoStub.getAllFromCurrentYear.resolves(mockEnrollments);

            const result = await enrollmentService.getCurrentYearEnrollments();
            assert.equal(result.length, 2);
            assert.deepEqual(result, mockEnrollments);
        });
    });

    describe('getAllEnrollments', () => {
        it('should return all enrollments', async () => {
            const mockEnrollments: EnrollmentEntity[] = [
                {id: 1, round: 1, startDate: new Date('2024-01-01'), endDate: new Date('2024-12-31')},
                {id: 2, round: 1, startDate: new Date('2024-01-01'), endDate: new Date('2024-12-31')}
            ];
            enrollmentRepoStub.getAll.resolves(mockEnrollments);

            const result = await enrollmentService.getAllEnrollments();
            assert.equal(result.length, 2);
            assert.deepEqual(result, mockEnrollments);
        });
    });

    describe('updateEnrollments', () => {
        it('should update enrollments', async () => {
            const mockExistingEnrollments: EnrollmentEntity[] = [
                {id: 1, round: 1, startDate: new Date('2024-01-01'), endDate: new Date('2024-12-31')},
                {id: 2, round: 1, startDate: new Date('2024-01-01'), endDate: new Date('2024-12-31')}
            ];

            enrollmentRepoStub.getAll.resolves(mockExistingEnrollments);

            await enrollmentService.updateEnrollments([
                /*{id: 1, round: 1, startDate: new Date('2024-01-01'), endDate: new Date('2024-12-31')} -- deleted*/
                {id: 2, round: 2, startDate: new Date('2025-01-01'), endDate: new Date('2025-12-31')}, // updated
                {id: 3, round: 1, startDate: new Date('2024-01-01'), endDate: new Date('2024-12-31')} // added
            ]);

            assert(enrollmentRepoStub.delete.calledWith(1))
            assert.equal(enrollmentRepoStub.delete.callCount, 1);

            assert(enrollmentRepoStub.update.calledWith(
                {id: 2, round: 2, startDate: new Date('2025-01-01'), endDate: new Date('2025-12-31')}
            ))
            assert.equal(enrollmentRepoStub.update.callCount, 1);

            assert(enrollmentRepoStub.insert.calledWith(
                {id: 3, round: 1, startDate: new Date('2024-01-01'), endDate: new Date('2024-12-31')}
            ))
            assert.equal(enrollmentRepoStub.insert.callCount, 1);
        });
    });


})
