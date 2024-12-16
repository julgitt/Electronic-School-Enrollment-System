import assert from 'assert';
import {afterEach} from 'mocha';
import sinon from 'sinon';

import {ApplicationService} from "../../../src/services/applicationService";
import {ApplicationRepository} from "../../../src/repositories/applicationRepository";
import {ITask} from "pg-promise";
import {SchoolService} from "../../../src/services/schoolService";
import {ProfileService} from "../../../src/services/profileService";
import {SchoolWithProfiles} from "../../../src/dto/schoolWithProfiles";
import {EnrollmentService} from "../../../src/services/enrollmentService";
import {ApplicationEntity} from "../../../src/models/applicationEntity";
import {ValidationError} from "../../../src/errors/validationError";
import {Enrollment} from "../../../src/dto/enrollment";
import {DataConflictError} from "../../../src/errors/dataConflictError";
import {ApplicationRequest} from "../../../src/dto/application/applicationRequest";
import {ApplicationStatus} from "../../../src/dto/application/applicationStatus";
import {ResourceNotFoundError} from "../../../src/errors/resourceNotFoundError";
import {ApplicationWithProfiles} from "../../../src/dto/application/applicationWithProfiles";

describe('ApplicationService', () => {
    let applicationService: ApplicationService;
    let applicationRepoStub: sinon.SinonStubbedInstance<ApplicationRepository>;
    let schoolServiceStub: sinon.SinonStubbedInstance<SchoolService>;
    let profileServiceStub: sinon.SinonStubbedInstance<ProfileService>;
    let enrollmentServiceStub: sinon.SinonStubbedInstance<EnrollmentService>;
    let txStub: sinon.SinonStub;

    beforeEach(() => {
        applicationRepoStub = sinon.createStubInstance(ApplicationRepository);
        schoolServiceStub = sinon.createStubInstance(SchoolService);
        profileServiceStub = sinon.createStubInstance(ProfileService);
        enrollmentServiceStub = sinon.createStubInstance(EnrollmentService);
        txStub = sinon.stub().callsFake(async (callback: (t: ITask<any>) => Promise<void>) => {
            await callback({} as unknown as ITask<any>);
        })

        applicationService = new ApplicationService(
            applicationRepoStub, profileServiceStub, enrollmentServiceStub, schoolServiceStub, txStub
        );
    });

    afterEach(() => {
        sinon.restore();
    })

    describe('getAllApplications', () => {
        it('should return all applications with profiles and schools', async () => {
            const mockApplications: ApplicationEntity[] = [{
                id: 1,
                candidateId: 1,
                profileId: 1,
                enrollmentId: 1,
                priority: 1,
                status: ApplicationStatus.Pending,
                createdAt: new Date(),
                updatedAt: new Date()
            }];
            const mockSchoolWithProfiles: SchoolWithProfiles = {
                id: 1,
                name: "Szkoła",
                profiles: [
                    {id: 1, name: "informatyczny", schoolId: 1, capacity: 20},
                    {id: 2, name: "historyczny", schoolId: 1, capacity: 20}
                ]
            }
            const mockProfile = {
                id: 1,
                name: "informatyczny",
                schoolId: 1,
                capacity: 20
            };
            const mockEnrollment = {
                id: 1,
                round: 1,
                startDate: new Date(),
                endDate: new Date()
            };

            applicationRepoStub.getAllByCandidate.resolves(mockApplications);
            schoolServiceStub.getSchoolWithProfiles.resolves(mockSchoolWithProfiles);
            profileServiceStub.getProfile.resolves(mockProfile);
            enrollmentServiceStub.getEnrollment.resolves(mockEnrollment);

            const result = await applicationService.getAllApplications(1);
            const expectedResult = [
                {
                    id: 1,
                    school: mockSchoolWithProfiles,
                    profile: mockProfile,
                    priority: 1,
                    round: 1,
                    status: ApplicationStatus.Pending,
                    createdAt: mockApplications[0].createdAt,
                    updatedAt: mockApplications[0].updatedAt
                }
            ];
            assert.equal(result.length, 1);
            assert.deepEqual(result, expectedResult);
        });
    });

    describe('addApplication', () => {
        it('should throw ValidationError if outside enrollment period', async () => {
            enrollmentServiceStub.getCurrentEnrollment.resolves(null);

            try {
                await applicationService.addApplication([], 1);
                assert.fail('Expected an error to be thrown');
            } catch (err) {
                assert(err instanceof ValidationError);
                assert.equal(err.message, 'Outside the enrollment period.')
            }
        });

        it('should throw DataConflictError if application already exists', async () => {
            const mockEnrollment: Enrollment = {
                id: 1,
                round: 1,
                startDate: new Date(),
                endDate: new Date()
            };

            enrollmentServiceStub.getCurrentEnrollment.resolves(mockEnrollment);
            applicationRepoStub.getAllByCandidateAndEnrollmentId.resolves([{
                id: 1,
                candidateId: 1,
                profileId: 1,
                enrollmentId: 1,
                status: ApplicationStatus.Pending,
                priority: 1
            } as ApplicationEntity]);

            try {
                await applicationService.addApplication([{profileId: 1, priority: 1}], 1);
            } catch (err) {
                assert(err instanceof DataConflictError);
                assert.equal(err.message, 'Application already exists');
            }
        });

        it('should throw ValidationError if profile does not exist', async () => {
            const mockEnrollment: Enrollment = {id: 1, round: 1, startDate: new Date(), endDate: new Date()};
            enrollmentServiceStub.getCurrentEnrollment.resolves(mockEnrollment);
            applicationRepoStub.getAllByCandidateAndEnrollmentId.resolves([]);

            profileServiceStub.getProfile.rejects(new ResourceNotFoundError('Nie znaleziono profilu.'));

            try {
                await applicationService.addApplication([{profileId: 1, priority: 1}], 1);
            } catch (err) {
                assert(err instanceof ResourceNotFoundError);
                assert.equal(err.message, 'Nie znaleziono profilu.');
            }
        });

        it('should successfully add a new application', async () => {
            const mockEnrollment: Enrollment = {
                id: 1,
                round: 1,
                startDate: new Date(),
                endDate: new Date()
            };

            enrollmentServiceStub.getCurrentEnrollment.resolves(mockEnrollment);
            applicationRepoStub.getAllByCandidateAndEnrollmentId.resolves([]);

            profileServiceStub.getProfile.resolves({
                id: 1,
                name: "informatyczny",
                schoolId: 1,
                capacity: 20
            });

            const submission: ApplicationRequest = {profileId: 1, priority: 1};
            await applicationService.addApplication([submission], 1);

            assert(applicationRepoStub.insert.calledOnce);
        });
    });

    describe('updateApplication', () => {
        it('should throw ResourceNotFoundError if no applications found for candidate and enrollment', async () => {
            const mockEnrollment: Enrollment = {
                id: 1,
                round: 1,
                startDate: new Date(),
                endDate: new Date()
            };
            enrollmentServiceStub.getCurrentEnrollment.resolves(mockEnrollment);
            applicationRepoStub.getAllByCandidateAndEnrollmentId.resolves([]);

            try {
                await applicationService.updateApplication([{profileId: 1, priority: 1}], 1);
            } catch (err) {
                assert(err instanceof ResourceNotFoundError);
                assert.equal(err.message, 'Applications not found.');
            }
        });

        it('should successfully update applications', async () => {
            const mockEnrollment: Enrollment = {
                id: 1,
                round: 1,
                startDate: new Date(),
                endDate: new Date()
            };

            const mockApplication: ApplicationEntity = {
                id: 1,
                candidateId: 1,
                profileId: 1,
                enrollmentId: 1,
                status: ApplicationStatus.Pending,
                priority: 1,
                createdAt: new Date(),
                updatedAt: new Date()
            }
            enrollmentServiceStub.getCurrentEnrollment.resolves(mockEnrollment);
            applicationRepoStub.getAllByCandidateAndEnrollmentId.resolves([mockApplication]);

            profileServiceStub.getProfile.resolves({id: 1, name: 'Profile 1', schoolId: 1, capacity: 20});

            const submissions: ApplicationRequest[] = [{profileId: 1, priority: 2}];
            await applicationService.updateApplication(submissions, 1);

            assert(applicationRepoStub.insert.calledOnce);
            assert(applicationRepoStub.delete.calledOnce);
        });

        it('should sort priorities correctly before adding them', async () => {
            const mockEnrollment: Enrollment = {id: 1, round: 1, startDate: new Date(), endDate: new Date()};
            enrollmentServiceStub.getCurrentEnrollment.resolves(mockEnrollment);
            applicationRepoStub.getAllByCandidateAndEnrollmentId.resolves([]);

            profileServiceStub.getProfile.resolves({id: 1, name: 'Profile 1', schoolId: 1, capacity: 20});

            const submissions: ApplicationRequest[] = [
                {profileId: 1, priority: 8},
                {profileId: 2, priority: 2},
                {profileId: 3, priority: 4},
            ];

            await applicationService.addApplication(submissions, 1);

            assert.equal(submissions[0].priority, 1);
            assert.equal(submissions[1].priority, 2);
            assert.equal(submissions[2].priority, 3);
        });
    });

    describe('getAllApplicationSubmissions', async () => {
        it('should group applications by school', async () => {
            const mockSchool1 = {id: 1, name: 'School1', profiles: []};
            const mockSchool2 = {id: 2, name: 'School2', profiles: []};
            const mockProfile1 = {id: 1, name: 'Profile1', schoolId: 1, capacity: 20};
            const mockProfile2 = {id: 2, name: 'Profile2', schoolId: 1, capacity: 20};
            const mockProfile3 = {id: 3, name: 'Profile3', schoolId: 2, capacity: 20};

            const mockApplicationsWithProfiles: ApplicationWithProfiles[] = [
                {
                    id: 1, school: mockSchool1, profile: mockProfile1,
                    priority: 1, round: 1, status: ApplicationStatus.Pending,
                    createdAt: new Date(), updatedAt: new Date(),
                },
                {
                    id: 2, school: mockSchool1, profile: mockProfile2,
                    priority: 2, round: 1, status: ApplicationStatus.Pending,
                    createdAt: new Date(), updatedAt: new Date(),
                },
                {
                    id: 3, school: mockSchool2, profile: mockProfile3,
                    priority: 3, round: 1, status: ApplicationStatus.Pending,
                    createdAt: new Date(), updatedAt: new Date(),
                }
            ];

            sinon.stub(applicationService, 'getAllApplications').resolves(mockApplicationsWithProfiles);

            const result = await applicationService.getAllApplicationSubmissions(1);

            const expected = [
                {school: mockSchool1, profiles: [{profileId: 1, priority: 1}, {profileId: 2, priority: 2}]},
                {school: mockSchool2, profiles: [{profileId: 3, priority: 3}]}
            ];

            assert.deepEqual(result, expected);
        });
    });


    describe('getAllPendingApplicationsByProfile', async () => {
        it('should return all pending applications for the given profile and priority', async () => {
            const mockApplications: ApplicationEntity[] = [{
                id: 1, candidateId: 1, profileId: 1, enrollmentId: 1, priority: 1, status: ApplicationStatus.Pending,
                createdAt: new Date(), updatedAt: new Date(),
            }];

            applicationRepoStub.getAllPendingByProfile.resolves(mockApplications);

            const result = await applicationService.getAllPendingApplicationsByProfile(1);

            assert.deepEqual(result, mockApplications);
            assert(applicationRepoStub.getAllPendingByProfile.calledOnceWith(1));
        });
    });

    describe('getAllEnrolledByProfile', async () => {
        it('should return the number of enrolled candidates for the given profile', async () => {
            applicationRepoStub.getEnrolledByProfile.resolves(10);

            const result = await applicationService.getAcceptedCountByProfile(1);

            assert.equal(result, 10);
            assert(applicationRepoStub.getEnrolledByProfile.calledOnceWith(1));
        });
    });

    describe('updateApplicationStatus', async () => {
        it('should update the status of an application', async () => {
            const transactionMock = {};
            applicationRepoStub.updateStatus.resolves();

            await applicationService.updateApplicationStatus(1, ApplicationStatus.Accepted, transactionMock as any);

            assert(applicationRepoStub.updateStatus.calledOnceWith(1, ApplicationStatus.Accepted, transactionMock));
        });
    });
})