import assert from 'assert';
import {afterEach} from 'mocha';
import sinon from 'sinon';

import {ProfileRepository} from "../../../src/repositories/profileRepository";
import {ProfileService} from "../../../src/services/profileService";
import {ProfileEntity} from "../../../src/models/profileEntity";
import {ProfileCriteriaEntity, ProfileCriteriaType} from "../../../src/models/profileCriteriaEntity";

describe('ProfileService', () => {
    let profileService: ProfileService;
    let profileRepoStub: sinon.SinonStubbedInstance<ProfileRepository>;

    beforeEach(() => {
        profileRepoStub = sinon.createStubInstance(ProfileRepository);
        profileService = new ProfileService(profileRepoStub);
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
                assert.equal((err as Error).message, 'Profile not found.')
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

    describe('getAllProfilesCriteria', () => {
        it('should return criteria grouped by profile', async () => {
            const mockCriteria: ProfileCriteriaEntity[] = [
                {id: 1, subjectId: 1, profileId: 1, type: ProfileCriteriaType.Mandatory},
                {id: 2, subjectId: 3, profileId: 1, type: ProfileCriteriaType.Alternative},
                {id: 3, subjectId: 2, profileId: 2, type: ProfileCriteriaType.Alternative}
            ];
            profileRepoStub.getAllProfilesCriteria.resolves(mockCriteria);

            const result = await profileService.getAllProfilesCriteria();
            assert.equal(profileRepoStub.getAllProfilesCriteria.callCount, 1);

            const expected = new Map<number, ProfileCriteriaEntity[]>();
            expected.set(1, [
                { id: 1, profileId: 1, subjectId: 1, type: ProfileCriteriaType.Mandatory },
                {id: 2, subjectId: 3, profileId: 1, type: ProfileCriteriaType.Alternative},
            ]);
            expected.set(2, [
                {id: 3, subjectId: 2, profileId: 2, type: ProfileCriteriaType.Alternative}
            ]);
            assert.deepEqual(result, expected);
        });
    });

})