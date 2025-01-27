import assert from 'assert';
import {afterEach} from 'mocha';
import sinon from 'sinon';

import { Application } from '../../../src/dto/application/application';
import { Candidate } from "../../../src/dto/candidate/candidate";
import { GradeType } from "../../../src/dto/grade/gradeType";
import { ProfileWithInfo } from "../../../src/dto/profile/profileInfo";
import { GradeEntity } from "../../../src/models/gradeEntity";
import { ProfileCriteriaType } from "../../../src/models/profileCriteriaEntity";
import { CandidateService } from "../../../src/services/candidateService";
import { GradeService } from "../../../src/services/gradeService";
import { RankListService } from "../../../src/services/rankListService";
import { SubjectService } from "../../../src/services/subjectService";
import { ProfileService } from "../../../src/services/profileService";
import { Subject } from "../../../src/dto/subject";
import {CandidateWithGrades} from "../../../src/dto/candidate/candidateWithGrades";

describe('RankListService', () => {
    let rankListService: RankListService;
    let profileServiceStub: sinon.SinonStubbedInstance<ProfileService>;
    let gradeServiceStub: sinon.SinonStubbedInstance<GradeService>;
    let subjectServiceStub: sinon.SinonStubbedInstance<SubjectService>;
    let candidateServiceStub: sinon.SinonStubbedInstance<CandidateService>;

    beforeEach(() => {
        gradeServiceStub = sinon.createStubInstance(GradeService);
        subjectServiceStub = sinon.createStubInstance(SubjectService);
        candidateServiceStub = sinon.createStubInstance(CandidateService);
        profileServiceStub = sinon.createStubInstance(ProfileService);

        rankListService = new RankListService(gradeServiceStub, subjectServiceStub, candidateServiceStub, profileServiceStub);
    });

    afterEach(() => {
        sinon.restore();
    })

    describe("getPoints", () => {
        it('should get points correctly for mandatory and alternative subjects', async () => {
            const mockProfileCriteria = [
                {id: 1, subjectId: 1, profileId: 1, type: ProfileCriteriaType.Mandatory},
                {id: 2, subjectId: 2, profileId: 1, type: ProfileCriteriaType.Alternative},
                {id: 3, subjectId: 3, profileId: 1, type: ProfileCriteriaType.Alternative}
            ];
            const mockGrades: GradeEntity[] = [
                {grade: 60, candidateId: 1, subjectId: 1, type: GradeType.Exam},
                {grade: 5, candidateId: 1, subjectId: 2, type: GradeType.Certificate},
                {grade: 4, candidateId: 1, subjectId: 1, type: GradeType.Certificate},
                {grade: 4, candidateId: 1, subjectId: 3, type: GradeType.Certificate},
            ];

            profileServiceStub.getProfileCriteria.resolves(mockProfileCriteria)
            gradeServiceStub.getAllByCandidate.resolves(mockGrades)
            subjectServiceStub.getSubject.withArgs(1).resolves({name: "matematyka"} as Subject)
            subjectServiceStub.getSubject.withArgs(2).resolves({name: "informatyka"} as Subject)
            subjectServiceStub.getSubject.withArgs(3).resolves({name: "chemia"} as Subject)

            const result = await rankListService.getPoints(1, 1);

            assert.equal(result.points, 52);
            assert.deepEqual(result.gradesInfo, [
                {grade: 5, subject: "informatyka", type: ProfileCriteriaType.Alternative},
                {grade: 4, subject: "matematyka", type: ProfileCriteriaType.Mandatory},
                {grade: 4, subject: "chemia", type: ProfileCriteriaType.Alternative},
            ]);
        });
    })

    describe('getRankListById', async () => {
        it('should get rank list with applications sort by points', async () => {
            const mockProfileCriteria = [
                {id: 1, subjectId: 1, profileId: 1, type: ProfileCriteriaType.Mandatory},
                {id: 2, subjectId: 2, profileId: 1, type: ProfileCriteriaType.Alternative},
                {id: 3, subjectId: 3, profileId: 1, type: ProfileCriteriaType.Alternative}
            ];
            const mockAcceptedApplications: Application[] = [];
            const mockPendingApplications: Application[] = [
                {id: 1, profileId: 1, candidateId: 1} as Application,
                {id: 2, profileId: 1, candidateId: 2} as Application,
                {id: 3, profileId: 1, candidateId: 3} as Application,
            ];
            const mockProfileCapacity: number = 2;

            candidateServiceStub.getAllWithGrades.resolves(mockGrades())

            profileServiceStub.getProfileWithInfo.resolves({
                id: 1,
                capacity: mockProfileCapacity,
                pending: mockPendingApplications,
                accepted: mockAcceptedApplications,
                criteria: mockProfileCriteria
            } as ProfileWithInfo);

            const result = await rankListService.getRankListById(1);

            assert.deepEqual(result.prevAccepted, []);
            assert.equal(result.reserve.length, 1);
            assert.equal(result.reserve[0].id, 1);
            assert.equal(result.reserve[0].points, 95);

            assert.equal(result.accepted.length, 2);
            assert.equal(result.accepted[0].id, 3);
            assert.equal(result.accepted[0].points, 139);

            assert.equal(result.accepted[1].id, 2);
            assert.equal(result.accepted[1].points, 106.75);

        })
    })

    describe('getEnrollmentLists', () => {
        it('should get all enrollemnt lists', async () => {
            const mockProfileCriteria = ((id: number) => [
                {id: 1, subjectId: 1, profileId: id, type: ProfileCriteriaType.Mandatory},
                {id: 2, subjectId: 2, profileId: id, type: ProfileCriteriaType.Alternative},
                {id: 3, subjectId: 3, profileId: id, type: ProfileCriteriaType.Alternative}
            ]);
            const mockAcceptedApplications: Application[] = [];
            const mockPendingApplications: Application[] = [
                {id: 1, profileId: 1, candidateId: 1} as Application,
                {id: 2, profileId: 1, candidateId: 2} as Application,
                {id: 3, profileId: 1, candidateId: 3} as Application,
            ];
            const mockProfileCapacity: number = 2;

            candidateServiceStub.getAllWithGrades.resolves(mockGrades())

            profileServiceStub.getProfilesWithInfo.resolves([{
                    id: 1,
                    capacity: mockProfileCapacity,
                    pending: mockPendingApplications,
                    accepted: mockAcceptedApplications,
                    criteria: mockProfileCriteria(1)
                } as ProfileWithInfo, {
                    id: 2,
                    capacity: mockProfileCapacity,
                    pending: [{id: 4, profileId: 2, candidateId: 2} as Application],
                    accepted: mockAcceptedApplications,
                    criteria: mockProfileCriteria(2)
                } as ProfileWithInfo]
            );

            const result = await rankListService.getEnrollmentLists();

            assert.equal(result.reserveByProfile.size, 2);
            assert.equal(profileServiceStub.getProfilesWithInfo.callCount, 1);
            assert.equal((result.reserveByProfile.get(1))?.length, 1);
            assert.equal(result.reserveByProfile.get(0), null);
            assert.equal((result.reserveByProfile.get(1))![0].id, 1)
            assert.equal(result.accepted.length, 3);
        });
    })

    function mockGrades(): CandidateWithGrades[] {
        return [{candidate: {id: 1} as Candidate, grades: [
                {subjectId: 1, type: GradeType.Exam, grade: 50},
                {subjectId: 1, type: GradeType.Certificate, grade: 3},
                {subjectId: 2, type: GradeType.Exam, grade: 50},
                {subjectId: 2, type: GradeType.Certificate, grade: 3},
                {subjectId: 3, type: GradeType.Exam, grade: 100},
                {subjectId: 3, type: GradeType.Certificate, grade: 5},
            ]}, {candidate: {id: 2} as Candidate, grades: [
                {subjectId: 1, type: GradeType.Exam, grade: 75},
                {subjectId: 1, type: GradeType.Certificate, grade: 4},
                {subjectId: 2, type: GradeType.Exam, grade: 75},
                {subjectId: 2, type: GradeType.Certificate, grade: 4},
                {subjectId: 3, type: GradeType.Exam, grade: 75},
                {subjectId: 3, type: GradeType.Certificate, grade: 4},
            ]}, {candidate: {id: 3} as Candidate, grades: [
                {subjectId: 1, type: GradeType.Exam, grade: 100},
                {subjectId: 1, type: GradeType.Certificate, grade: 5},
                {subjectId: 2, type: GradeType.Exam, grade: 100},
                {subjectId: 2, type: GradeType.Certificate, grade: 5},
                {subjectId: 3, type: GradeType.Exam, grade: 100},
                {subjectId: 3, type: GradeType.Certificate, grade: 5}
            ]}
        ]
    }
})