import assert from 'assert';
import {afterEach} from 'mocha';
import sinon from 'sinon';

import { profileService } from "../../../src/dependencyContainer";
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
import { Application } from '../../../src/dto/application/application';

describe('ProfileService', () => {
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
            gradeServiceStub.getAllByCandidate.callsFake((candidateId: number) => {
                return Promise.resolve(getMockGradesByCandidate(candidateId));
            });

            candidateServiceStub.getCandidateById.callsFake((candidateId: number) => {
                return Promise.resolve({id: candidateId} as Candidate)
            });

            profileServiceStub.getProfileWithInfo.resolves({id: 1} as ProfileWithInfo);

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

    describe('getAllRankLists', () => {
        it('should get all rank lists for all profiles', async () => {
            const getRankListStub = sinon.stub(rankListService, 'getRankListById');
            getRankListStub.callsFake((_profileId: number) => {
                return Promise.resolve({accepted: [], reserve: [], prevAccepted: []});
            });
            const getProfilesWithInfoStub = sinon.stub(profileService, 'getProfilesWithInfo');
            getProfilesWithInfoStub.callsFake(() => {
                return Promise.resolve([{id: 1} as ProfileWithInfo, {id: 2} as ProfileWithInfo, {id: 3} as ProfileWithInfo]);
            });

            const result = await rankListService.getAllRankLists();

            assert.equal(result.size, 3);
            assert(result.has(1));
            assert(result.has(2));
            assert(result.has(3));
            assert.equal(getProfilesWithInfoStub.callCount, 1);
            assert.equal(getRankListStub.callCount, 3);
        });
    })

    function getMockGradesByCandidate(id: number): GradeEntity[] {
        const grades = new Map([
            [1, [
                {subjectId: 1, type: GradeType.Exam, candidateId: 1, grade: 50}, {
                    subjectId: 1,
                    type: GradeType.Certificate,
                    candidateId: 1,
                    grade: 3
                },
                {subjectId: 2, type: GradeType.Exam, candidateId: 1, grade: 50}, {
                    subjectId: 2,
                    type: GradeType.Certificate,
                    candidateId: 1,
                    grade: 3
                },
                {subjectId: 3, type: GradeType.Exam, candidateId: 1, grade: 100}, {
                    subjectId: 3,
                    type: GradeType.Certificate,
                    candidateId: 1,
                    grade: 5
                },
            ]],
            [2, [
                {subjectId: 1, type: GradeType.Exam, grade: 75, candidateId: 2}, {
                    subjectId: 1,
                    type: GradeType.Certificate,
                    grade: 4,
                    candidateId: 2
                },
                {subjectId: 2, type: GradeType.Exam, grade: 75, candidateId: 2}, {
                    subjectId: 2,
                    type: GradeType.Certificate,
                    grade: 4,
                    candidateId: 2
                },
                {subjectId: 3, type: GradeType.Exam, grade: 75, candidateId: 2}, {
                    subjectId: 3,
                    type: GradeType.Certificate,
                    grade: 4,
                    candidateId: 2
                },
            ]],
            [3, [
                {subjectId: 1, type: GradeType.Exam, candidateId: 3, grade: 100}, {
                    subjectId: 1,
                    type: GradeType.Certificate,
                    candidateId: 3,
                    grade: 5
                },
                {subjectId: 2, type: GradeType.Exam, candidateId: 3, grade: 100}, {
                    subjectId: 2,
                    type: GradeType.Certificate,
                    candidateId: 3,
                    grade: 5
                },
                {subjectId: 3, type: GradeType.Exam, candidateId: 3, grade: 100}, {
                    subjectId: 3,
                    type: GradeType.Certificate,
                    candidateId: 3,
                    grade: 5
                }
            ]],
        ])
        return grades.get(id) || [];
    }