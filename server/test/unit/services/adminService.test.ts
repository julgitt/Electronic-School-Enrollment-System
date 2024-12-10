import {afterEach} from 'mocha';
import sinon from 'sinon';

import {AdminService} from "../../../src/services/adminService";
import {ITask} from "pg-promise";
import {ProfileService} from "../../../src/services/profileService";
import {CandidateService} from "../../../src/services/candidateService";
import {ApplicationService} from "../../../src/services/applicationService";
import {Grade} from "../../../src/dto/grade";
import {Application} from "../../../src/dto/application";
import {ApplicationStatus} from "../../../src/dto/applicationStatus";
import assert from "assert";
import {ProfileCriteriaEntity, ProfileCriteriaType} from "../../../src/models/profileCriteriaEntity";
import {Profile} from "../../../src/dto/profile";

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

    describe('enroll', async () => {
        it('should enroll candidates based on profile priorities and capacities', async () => {
            const mockProfiles: Profile[] = createMockProfiles();
            const mockGradesByCandidate: Map<number, Grade[]> = createMockGradesByCandidate();
            const mockApplications: Application[] = createMockApplications();
            const mockProfileCriteria: Map<number, ProfileCriteriaEntity[]> = createMockProfileCriteria();

            profileServiceStub.getAllProfiles.resolves(mockProfiles);
            profileServiceStub.getAllProfilesCriteria.resolves(mockProfileCriteria)

            applicationServiceStub.getMaxPriority.resolves(2);
            candidateServiceStub.getAllWithGrades.resolves(mockGradesByCandidate);

            applicationServiceStub.getAllPendingApplicationsByProfileAndPriority.resolves(mockApplications);
            applicationServiceStub.getAllEnrolledByProfile.resolves(0);

            await adminService.enroll();

            assert(applicationServiceStub.updateApplicationStatus.calledWith(1, ApplicationStatus.Accepted));
            assert(applicationServiceStub.updateApplicationStatus.calledWith(2, ApplicationStatus.Accepted));
            assert(applicationServiceStub.updateApplicationStatus.calledWith(3, ApplicationStatus.Accepted));

            assert(applicationServiceStub.updateApplicationStatus.calledWith(4, ApplicationStatus.Rejected));
            assert(applicationServiceStub.updateApplicationStatus.calledWith(5, ApplicationStatus.Rejected));
            assert(applicationServiceStub.updateApplicationStatus.calledWith(6, ApplicationStatus.Rejected));

            assert(applicationServiceStub.updateApplicationStatus.calledWith(7, ApplicationStatus.Accepted));
            assert(applicationServiceStub.updateApplicationStatus.calledWith(8, ApplicationStatus.Rejected));
            assert(applicationServiceStub.updateApplicationStatus.calledWith(9, ApplicationStatus.Accepted));
        });
    });

    function createMockProfileCriteria() {
        return  new Map([
            [1, [
                { id: 1, subjectId: 1, profileId: 1, type: ProfileCriteriaType.Mandatory },
                { id: 2, subjectId: 2, profileId: 1, type: ProfileCriteriaType.Mandatory }
                ]
            ], [2, [
                { id: 3, subjectId: 1, profileId: 2, type: ProfileCriteriaType.Mandatory },
                { id: 4, subjectId: 2, profileId: 2, type: ProfileCriteriaType.Mandatory }
                ]
            ], [3, [
                { id: 5, subjectId: 1, profileId: 3, type: ProfileCriteriaType.Mandatory },
                { id: 6, subjectId: 2, profileId: 3, type: ProfileCriteriaType.Mandatory }
                ]
            ]
        ]);
    }

    function createMockProfiles() {
        return [
            { id: 1, name: 'Profile1', capacity: 3, schoolId: 1 },
            { id: 2, name: 'Profile2', capacity: 2, schoolId: 1 },
            { id: 3, name: 'Profile3', capacity: 2, schoolId: 2 },
            { id: 4, name: 'Profile4', capacity: 3, schoolId: 2 },
        ];
    }

    function createMockGradesByCandidate() {
        return new Map([
            [1, [{ subjectId: 1, type: 'exam', grade: 8 }, { subjectId: 2, type: 'exam', grade: 10 }]],
            [2, [{ subjectId: 1, type: 'exam', grade: 9 }, { subjectId: 2, type: 'exam', grade: 9 }]],
            [3, [{ subjectId: 1, type: 'exam', grade: 10 }, { subjectId: 2, type: 'exam', grade: 10 }]],
            [4, [{ subjectId: 1, type: 'exam', grade: 7 }, { subjectId: 2, type: 'exam', grade: 6 }]],
            [5, [{ subjectId: 1, type: 'exam', grade: 9 }, { subjectId: 2, type: 'exam', grade: 8 }]],
            [6, [{ subjectId: 1, type: 'exam', grade: 5 }, { subjectId: 2, type: 'exam', grade: 7 }]]
        ]);
    }

    function createMockApplications() {
        return [
            { id: 1, candidateId: 1, profileId: 1, status: ApplicationStatus.Pending, priority: 1 },
            { id: 2, candidateId: 1, profileId: 2, status: ApplicationStatus.Pending, priority: 1 },
            { id: 3, candidateId: 1, profileId: 3, status: ApplicationStatus.Pending, priority: 1 },

            { id: 4, candidateId: 2, profileId: 1, status: ApplicationStatus.Pending, priority: 1 },
            { id: 5, candidateId: 2, profileId: 2, status: ApplicationStatus.Pending, priority: 1 },
            { id: 6, candidateId: 2, profileId: 3, status: ApplicationStatus.Pending, priority: 2 },

            { id: 7, candidateId: 3, profileId: 1, status: ApplicationStatus.Pending, priority: 1 },
            { id: 8, candidateId: 3, profileId: 2, status: ApplicationStatus.Pending, priority: 2 },
            { id: 9, candidateId: 3, profileId: 3, status: ApplicationStatus.Pending, priority: 1 },

            { id: 10, candidateId: 4, profileId: 1, status: ApplicationStatus.Pending, priority: 1 },
            { id: 11, candidateId: 4, profileId: 2, status: ApplicationStatus.Pending, priority: 1 },
            { id: 12, candidateId: 4, profileId: 3, status: ApplicationStatus.Pending, priority: 2 },

            { id: 13, candidateId: 5, profileId: 1, status: ApplicationStatus.Pending, priority: 1 },
            { id: 14, candidateId: 5, profileId: 2, status: ApplicationStatus.Pending, priority: 2 },
            { id: 15, candidateId: 5, profileId: 3, status: ApplicationStatus.Pending, priority: 1 },

            { id: 16, candidateId: 6, profileId: 1, status: ApplicationStatus.Pending, priority: 1 },
            { id: 17, candidateId: 6, profileId: 2, status: ApplicationStatus.Pending, priority: 1 },
            { id: 18, candidateId: 6, profileId: 3, status: ApplicationStatus.Pending, priority: 2 }
        ];
    }
})