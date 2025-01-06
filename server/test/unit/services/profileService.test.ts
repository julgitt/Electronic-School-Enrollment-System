import assert from 'assert';
import {afterEach} from 'mocha';
import sinon from 'sinon';

import {ProfileRepository} from "../../../src/repositories/profileRepository";
import {ProfileService} from "../../../src/services/profileService";
import {ProfileEntity} from "../../../src/models/profileEntity";
import {GradeService} from "../../../src/services/gradeService";
import {SubjectService} from "../../../src/services/subjectService";
import {CandidateService} from "../../../src/services/candidateService";
import {SchoolService} from "../../../src/services/schoolService";
import {ApplicationService} from "../../../src/services/applicationService";
import {ResourceNotFoundError} from "../../../src/errors/resourceNotFoundError";
import {ProfileCriteria} from "../../../src/dto/criteriaByProfile";
import {ProfileCriteriaType} from "../../../src/models/profileCriteriaEntity";
import {Application} from '../../../src/dto/application/application';
import {School} from "../../../src/dto/school/school";
import {Subject} from '../../../src/dto/subject';
import {Profile} from "../../../src/dto/profile/profile";
import {ProfileRequest} from "../../../src/dto/profile/profileRequest";
import {DataConflictError} from "../../../src/errors/dataConflictError";
import {GradeType} from "../../../src/dto/grade/gradeType";
import {GradeEntity} from "../../../src/models/gradeEntity";

describe('ProfileService', () => {
    let profileService: ProfileService;
    let profileRepoStub: sinon.SinonStubbedInstance<ProfileRepository>;
    let gradeServiceStub: sinon.SinonStubbedInstance<GradeService>;
    let subjectServiceStub: sinon.SinonStubbedInstance<SubjectService>;
    let candidateServiceStub: sinon.SinonStubbedInstance<CandidateService>;
    let schoolServiceStub: sinon.SinonStubbedInstance<SchoolService>;
    let applicationServiceStub: sinon.SinonStubbedInstance<ApplicationService>;
    let txStub: sinon.SinonStub;

    beforeEach(() => {
        profileRepoStub = sinon.createStubInstance(ProfileRepository);
        gradeServiceStub = sinon.createStubInstance(GradeService);
        subjectServiceStub = sinon.createStubInstance(SubjectService);
        candidateServiceStub = sinon.createStubInstance(CandidateService);
        schoolServiceStub = sinon.createStubInstance(SchoolService);
        applicationServiceStub = sinon.createStubInstance(ApplicationService);
        txStub = sinon.stub().callsFake(async (callback) => {
            await callback({});
        })

        profileService = new ProfileService(profileRepoStub, gradeServiceStub, subjectServiceStub, candidateServiceStub, txStub);
        profileService.setSchoolService(schoolServiceStub)
        profileService.setApplicationService(applicationServiceStub)
    });

    afterEach(() => {
        sinon.restore();
    })

    describe('getProfile', () => {
        it('should return profile when profile exists', async () => {
            const mockProfile: ProfileEntity = {
                id: 1,
                name: "Informatyczny",
                schoolId: 2,
                capacity: 20
            };

            profileRepoStub.getById.resolves(mockProfile);

            const result = await profileService.getProfile(1);

            assert.equal(profileRepoStub.getById.callCount, 1);
            assert.equal(result, mockProfile);
        });

        it('should throw an error when profile does not exist', async () => {
            profileRepoStub.getById.resolves(null);

            try {
                await profileService.getProfile(1);
                assert.fail('Expected an error to be thrown');
            } catch (err) {
                assert.equal((err as Error).message, 'Profil nie znaleziony.')
            }

            assert.equal(profileRepoStub.getById.callCount, 1);
        });
    });

    describe('getProfilesBySchool', () => {
        it('should return all profiles for a school', async () => {
            const mockProfiles: ProfileEntity[] = [
                {id: 1, name: "Informatyczny", schoolId: 2, capacity: 20},
                {id: 2, name: "Biologiczny", schoolId: 2, capacity: 20}
            ];
            profileRepoStub.getAllBySchool.resolves(mockProfiles);

            const result = await profileService.getProfilesBySchool(1);

            assert.equal(profileRepoStub.getAllBySchool.callCount, 1);
            assert.equal(result, mockProfiles);
        });
        it('should return an empty array when no profiles exist for school', async () => {
            const mockProfiles: ProfileEntity[] = []
            profileRepoStub.getAllBySchool.resolves(mockProfiles);

            const result = await profileService.getProfilesBySchool(1);

            assert.equal(profileRepoStub.getAllBySchool.callCount, 1);
            assert.equal(result, mockProfiles);
        })
    });

    describe('getAllProfiles', () => {
        it('should return all profiles', async () => {
            const mockProfiles: ProfileEntity[] = [
                {id: 1, name: "Informatyczny", schoolId: 1, capacity: 20},
                {id: 2, name: "Biologiczny", schoolId: 2, capacity: 20}
            ];
            profileRepoStub.getAll.resolves(mockProfiles);

            const result = await profileService.getAllProfiles();

            assert.equal(profileRepoStub.getAll.callCount, 1);
            assert.equal(result, mockProfiles);
        });
    });

    describe('getProfileByIdAndSchoolId', () => {
        it('should return profile if exist', async () => {
            const mockProfile: ProfileEntity = {
                id: 1, name: "Informatyczny", schoolId: 1, capacity: 20
            };
            const mockCriteria: ProfileCriteria[] = [
                {id: 1, profileId: 1, subjectId: 1, type: ProfileCriteriaType.Alternative},
            ];

            profileRepoStub.getById.resolves(mockProfile);
            profileRepoStub.getProfileCriteria.resolves(mockCriteria);

            const result = await profileService.getProfileByIdAndSchoolId(1, 1);

            assert.equal(profileRepoStub.getById.callCount, 1);
            assert.equal(profileRepoStub.getProfileCriteria.callCount, 1);
            assert.deepEqual(result, {...mockProfile, criteria: mockCriteria});
        });

        it('should throw error profile if exist', async () => {
            const mockProfile: ProfileEntity = {
                id: 1, name: "Informatyczny", schoolId: 1, capacity: 20
            };
            profileRepoStub.getById.resolves(mockProfile);

            await assert.rejects(
                () => profileService.getProfileByIdAndSchoolId(1, 2),
                (err) => err instanceof ResourceNotFoundError && err.message === "Profil nie znaleziony."
            );

            assert.equal(profileRepoStub.getById.callCount, 1);
            assert.equal(profileRepoStub.getProfileCriteria.callCount, 0);
        });
    });

    describe('getProfileBySchool', () => {
        it('should return profile if exist', async () => {
            const mockProfile: ProfileEntity = {
                id: 1, name: "Informatyczny", schoolId: 2, capacity: 20
            };
            const mockCriteria: ProfileCriteria[] = [
                {id: 1, profileId: 1, subjectId: 1, type: ProfileCriteriaType.Alternative},
            ];

            profileRepoStub.getBySchool.resolves(mockProfile);
            profileRepoStub.getProfileCriteria.resolves(mockCriteria);

            const result = await profileService.getProfileBySchool(2);

            assert.equal(profileRepoStub.getBySchool.callCount, 1);
            assert.equal(profileRepoStub.getProfileCriteria.callCount, 1);
            assert.deepEqual(result, {...mockProfile, criteria: mockCriteria});
        });
    });

    describe('getProfilesWithInfo', () => {
        it('should return profile with additional info if exist', async () => {
            const mockProfile = {id: 1, name: "Informatyczny", schoolId: 2, capacity: 20};
            const mockProfiles: ProfileEntity[] = [
                {id: 1, name: "Informatyczny", schoolId: 2, capacity: 20},
            ];
            const mockCriteria: ProfileCriteria[] = [
                {id: 1, profileId: 1, subjectId: 1, type: ProfileCriteriaType.Alternative},
            ];
            const mockSchool = {name: "school"} as School

            profileRepoStub.getAll.resolves(mockProfiles);
            profileRepoStub.getProfileCriteria.resolves(mockCriteria);
            schoolServiceStub.getSchool.resolves(mockSchool);
            applicationServiceStub.getAllPendingByProfile.resolves([{} as Application, {} as Application]);
            subjectServiceStub.getSubject.resolves({name: "matematyka"} as Subject)
            const result = await profileService.getProfilesWithInfo();

            assert.equal(profileRepoStub.getAll.callCount, 1);
            assert.equal(profileRepoStub.getProfileCriteria.callCount, 1);
            assert.deepEqual(result, [{
                id: mockProfile.id,
                name: mockProfile.name,
                schoolName: mockSchool.name,
                criteriaSubjects: ["matematyka"],
                applicationNumber: 2
            }]);
        });

        describe('deleteProfile', () => {
            it('should delete profile if exist', async () => {
                const mockProfile = {
                    id: 1,
                    name: "Informatyczny",
                    schoolId: 2,
                    capacity: 20
                };

                profileRepoStub.getById.resolves(mockProfile);

                await profileService.deleteProfile(1, 2);
                assert.equal(profileRepoStub.getById.callCount, 1);
                assert.equal(profileRepoStub.delete.callCount, 1);
            })
        })
    });

    describe('addProfile', () => {
        it('should add profile if profile with same name and school does not exist', async () => {
            const schoolId = 1;
            const mockCriteria: ProfileCriteria[] = [{
                id: 0,
                profileId: 0,
                subjectId: 1,
                type: ProfileCriteriaType.Alternative
            }];

            const mockProfile: ProfileRequest = {
                id: 0,
                name: "informatyczny",
                capacity: 5,
                criteria: mockCriteria
            }
            profileRepoStub.getBySchoolAndName.resolves(null);
            profileRepoStub.insert.resolves({...mockProfile, schoolId} as ProfileEntity);

            await profileService.addProfile(mockProfile, schoolId);
            assert.equal(profileRepoStub.getBySchoolAndName.callCount, 1);
            assert.equal(profileRepoStub.insert.callCount, 1);
            const expected: Profile = {
                id: mockProfile.id,
                name: mockProfile.name,
                capacity: mockProfile.capacity,
                schoolId: schoolId
            }
            assert(profileRepoStub.insert.calledWith(expected));
            assert.equal(profileRepoStub.insertCriteria.callCount, 1);
            assert(profileRepoStub.insertCriteria.calledWith(mockCriteria[0]));
        })

        it('should throw error if profile already exists', async () => {
            const criteria: ProfileCriteria[] = [{
                id: 1,
                profileId: 1,
                subjectId: 1,
                type: ProfileCriteriaType.Alternative
            }];

            const profile: ProfileRequest = {
                id: 0,
                name: "informatyczny",
                capacity: 5,
                criteria: criteria
            }

            const mockProfile = {
                id: 1,
                name: "Informatyczny",
                schoolId: 2,
                capacity: 20
            };

            profileRepoStub.getBySchoolAndName.resolves(mockProfile);

            await assert.rejects(
                () => profileService.addProfile(profile, 2),
                (err) => err instanceof DataConflictError && err.message === 'Profil o podanej nazwie już istnieje.'
            )
            assert.equal(profileRepoStub.getBySchoolAndName.callCount, 1);
            assert.equal(profileRepoStub.insert.callCount, 0);
        })
    })

    describe('updateProfile', () => {
        it('should update profile', async () => {
            const schoolId = 1;
            const criteria: ProfileCriteria[] = [{
                id: 0,
                profileId: 0,
                subjectId: 1,
                type: ProfileCriteriaType.Alternative
            }];

            const updatedProfile: ProfileRequest = {
                id: 0,
                name: "informatyczny",
                capacity: 5,
                criteria: criteria
            }

            const mockProfile: Profile = {
                id: 0,
                name: "fizyczny",
                schoolId: schoolId,
                capacity: 5,
            }

            profileRepoStub.getById.resolves(mockProfile);
            profileRepoStub.getProfileCriteria.resolves(criteria)

            await profileService.updateProfile(updatedProfile, schoolId);

            assert.equal(profileRepoStub.update.callCount, 1);
            const expected = {
                id: 0,
                name: updatedProfile.name,
                schoolId: schoolId,
                capacity: updatedProfile.capacity,
            }
            assert(profileRepoStub.update.calledWith(expected));
            assert.equal(profileRepoStub.deleteCriteriaByProfile.callCount, 1);
            assert(profileRepoStub.deleteCriteriaByProfile.calledWith(updatedProfile.id));

            assert.equal(profileRepoStub.insertCriteria.callCount, 1);
            assert(profileRepoStub.insertCriteria.calledWith(criteria[0]));
        })
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

            profileRepoStub.getProfileCriteria.resolves(mockProfileCriteria)
            gradeServiceStub.getAllByCandidate.resolves(mockGrades)
            subjectServiceStub.getSubject.withArgs(1).resolves({name: "matematyka"} as Subject)
            subjectServiceStub.getSubject.withArgs(2).resolves({name: "informatyka"} as Subject)
            subjectServiceStub.getSubject.withArgs(3).resolves({name: "chemia"} as Subject)

            const result = await profileService.getPoints(1, 1);

            assert.equal(result.points, 52);
            assert.deepEqual(result.gradesInfo, [
                {grade: 5, subject: "informatyka", type: ProfileCriteriaType.Alternative},
                {grade: 4, subject: "matematyka", type: ProfileCriteriaType.Mandatory},
                {grade: 4, subject: "chemia", type: ProfileCriteriaType.Alternative},
            ]);
        });
    })
})