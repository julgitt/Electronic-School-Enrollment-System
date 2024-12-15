import {afterEach} from 'mocha';
import sinon from 'sinon';

import {AdminService} from "../../../src/services/adminService";
import {ITask} from "pg-promise";
import {ProfileService} from "../../../src/services/profileService";
import {CandidateService} from "../../../src/services/candidateService";
import {ApplicationService} from "../../../src/services/applicationService";
import {ApplicationStatus} from "../../../src/dto/application/applicationStatus";
import assert from "assert";
import {ProfileCriteriaType} from "../../../src/models/profileCriteriaEntity";
import {GradeType} from "../../../src/dto/grade/gradeType";

describe('AdminService', () => {
    let adminService: AdminService;
    let candidateServiceStub: sinon.SinonStubbedInstance<CandidateService>;
    let profileServiceStub: sinon.SinonStubbedInstance<ProfileService>;
    let applicationServiceStub: sinon.SinonStubbedInstance<ApplicationService>;
    let txStub: sinon.SinonStub;

    beforeEach(() => {
        candidateServiceStub = sinon.createStubInstance(CandidateService);
        applicationServiceStub = sinon.createStubInstance(ApplicationService);
        profileServiceStub = sinon.createStubInstance(ProfileService);
        txStub = sinon.stub().callsFake(async (callback: (t: ITask<any>) => Promise<void>) => {
            await callback({} as unknown as ITask<any>);
        })

        adminService = new AdminService(
            candidateServiceStub,
            profileServiceStub,
            applicationServiceStub,
            txStub
        );
    });

    afterEach(() => {
        sinon.restore();
    })

    describe('processProfileEnrollments', () => {
        it('should process profile enrollments successfully', async () => {
            const mockProfiles = createMockProfiles();
            const mockCriteria = createMockProfileCriteria();
            const gradesByCandidate = createMockGradesByCandidate();

            profileServiceStub.getAllProfiles.resolves(mockProfiles);
            profileServiceStub.getAllProfilesCriteria.resolves(mockCriteria);
            candidateServiceStub.getGradesByCandidates.resolves(gradesByCandidate);
            applicationServiceStub.getAcceptedCountByProfile.resolves(0);
            applicationServiceStub.getAllPendingApplicationsByProfile.callsFake((profileId) => {
                return Promise.resolve(getPendingApplicationsByProfile(profileId));
            });

            // when
            await adminService.processProfileEnrollments();

            // then
            assert(profileServiceStub.getAllProfiles.calledOnce);

            const calls = applicationServiceStub.updateApplicationStatus.getCalls();
            assert.strictEqual(calls.length, 8);

            const expectedArgs = [
                [1, ApplicationStatus.Accepted],
                [2, ApplicationStatus.Rejected],
                [3, ApplicationStatus.Rejected],
                [4, ApplicationStatus.Accepted],
                [5, ApplicationStatus.Rejected],
                [6, ApplicationStatus.Accepted],
                [7, ApplicationStatus.Rejected],
                [8, ApplicationStatus.Rejected]
            ];

            assert.strictEqual(calls.length, expectedArgs.length);

            for (let i = 0; i < calls.length; i++) {
                const appId: number = calls[i].args[0];
                const appStatus = calls[i].args[1];
                assert.deepStrictEqual(
                    appStatus,
                    expectedArgs.find(args => args[0] === appId)![1],
                    `for ID ${appId}`
                );
            }
        });
    });

    describe('calculatePoints', () => {
        it('should calculate points correctly for mandatory and alternative subjects', () => {
            const mockProfileCriteria = [
                {id: 1, subjectId: 1, profileId: 1, type: ProfileCriteriaType.Mandatory},
                {id: 2, subjectId: 2, profileId: 1, type: ProfileCriteriaType.Alternative},
                {id: 3, subjectId: 3, profileId: 1, type: ProfileCriteriaType.Alternative}
            ];
            const mockGrades = [
                {grade: 60, subjectId: 1, type: GradeType.Exam},
                {grade: 5, subjectId: 2, type: GradeType.Certificate},
                {grade: 4, subjectId: 2, type: GradeType.Certificate}
            ];

            const result = adminService.calculatePoints(mockProfileCriteria, mockGrades);

            assert.equal(result, 17);
        });
    });

    function createMockProfileCriteria() {
        return new Map([
            [1, [
                {id: 1, subjectId: 1, profileId: 1, type: ProfileCriteriaType.Mandatory},
                {id: 2, subjectId: 2, profileId: 1, type: ProfileCriteriaType.Mandatory},
            ]
            ], [2, [
                {id: 8, subjectId: 2, profileId: 2, type: ProfileCriteriaType.Mandatory},
                {id: 9, subjectId: 3, profileId: 2, type: ProfileCriteriaType.Mandatory},
            ]
            ], [3, [
                {id: 10, subjectId: 1, profileId: 3, type: ProfileCriteriaType.Mandatory},
                {id: 13, subjectId: 2, profileId: 3, type: ProfileCriteriaType.Alternative},
                {id: 14, subjectId: 3, profileId: 3, type: ProfileCriteriaType.Alternative}
            ]
            ],
        ]);
    }

    function createMockProfiles() {
        return [
            {id: 1, name: 'informatyczny', capacity: 1, schoolId: 1},
            {id: 2, name: 'biologiczno-chemiczny', capacity: 1, schoolId: 1},
            {id: 3, name: 'historyczny', capacity: 1, schoolId: 2},
        ];
    }

    function createMockGradesByCandidate() {
        return new Map([
            [1, [
                {subjectId: 1, type: GradeType.Exam, grade: 50}, {subjectId: 1, type: GradeType.Certificate, grade: 3},
                {subjectId: 2, type: GradeType.Exam, grade: 50}, {subjectId: 2, type: GradeType.Certificate, grade: 3},
                {subjectId: 3, type: GradeType.Exam, grade: 100}, {subjectId: 3, type: GradeType.Certificate, grade: 5},
            ]
            ],
            [2, [
                {subjectId: 1, type: GradeType.Exam, grade: 75}, {subjectId: 1, type: GradeType.Certificate, grade: 4},
                {subjectId: 2, type: GradeType.Exam, grade: 75}, {subjectId: 2, type: GradeType.Certificate, grade: 4},
                {subjectId: 3, type: GradeType.Exam, grade: 75}, {subjectId: 3, type: GradeType.Certificate, grade: 4},
            ]
            ],
            [3, [
                {subjectId: 1, type: GradeType.Exam, grade: 100}, {subjectId: 1, type: GradeType.Certificate, grade: 5},
                {subjectId: 2, type: GradeType.Exam, grade: 100}, {subjectId: 2, type: GradeType.Certificate, grade: 5},
                {subjectId: 3, type: GradeType.Exam, grade: 100}, {subjectId: 3, type: GradeType.Certificate, grade: 5}
            ]
            ],
            [4, [
                {subjectId: 1, type: GradeType.Exam, grade: 80}, {subjectId: 1, type: GradeType.Certificate, grade: 5},
                {subjectId: 2, type: GradeType.Exam, grade: 60}, {subjectId: 2, type: GradeType.Certificate, grade: 4},
                {subjectId: 3, type: GradeType.Exam, grade: 60}, {subjectId: 3, type: GradeType.Certificate, grade: 4}
            ]
            ],
        ])
    }

    function getPendingApplicationsByProfile(profileId: number) {
        const applicationsMap = new Map([
            [1, [
                {id: 1, candidateId: 3, profileId: 1, status: ApplicationStatus.Pending, priority: 1},
                {id: 3, candidateId: 2, profileId: 1, status: ApplicationStatus.Pending, priority: 1},
                {id: 5, candidateId: 1, profileId: 1, status: ApplicationStatus.Pending, priority: 1},
                {id: 7, candidateId: 4, profileId: 1, status: ApplicationStatus.Pending, priority: 1}
            ]],
            [2, [
                {id: 2, candidateId: 3, profileId: 2, status: ApplicationStatus.Pending, priority: 2},
                {id: 4, candidateId: 2, profileId: 2, status: ApplicationStatus.Pending, priority: 2},
                {id: 8, candidateId: 4, profileId: 2, status: ApplicationStatus.Pending, priority: 2}
            ]],
            [3, [
                {id: 6, candidateId: 1, profileId: 3, status: ApplicationStatus.Pending, priority: 2}
            ]]
        ]);
        return applicationsMap.get(profileId) || [];
    }
})
