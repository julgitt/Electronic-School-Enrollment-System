/*
import assert from 'assert';
import {afterEach} from 'mocha';
import sinon from 'sinon';

import {SchoolService} from "../../../src/services/schoolService";
import {SchoolRepository} from "../../../src/repositories/schoolRepository";
import {ProfileService} from "../../../src/services/profileService";
import {SchoolEntity} from "../../../src/models/schoolEntity";
import {ResourceNotFoundError} from "../../../src/errors/resourceNotFoundError";

describe('SchoolService', () => {
    let schoolService: SchoolService;
    let schoolRepoStub: sinon.SinonStubbedInstance<SchoolRepository>;
    let profileServiceStub: sinon.SinonStubbedInstance<ProfileService>;

    beforeEach(() => {
        schoolRepoStub = sinon.createStubInstance(SchoolRepository);
        profileServiceStub = sinon.createStubInstance(ProfileService);
        schoolService = new SchoolService(schoolRepoStub, profileServiceStub);
    });

    afterEach(() => {
        sinon.restore();
    })

    describe('getAllSchoolsWithProfiles', () => {
        it('should return a list of schools with profiles', async () => {
            const mockSchools: SchoolEntity[] = [
                {id: 1, name: 'School 1'},
                {id: 2, name: 'School 2'}
            ];

            const mockProfiles1 = [
                {id: 1, name: "Informatyczny", schoolId: 1, capacity: 20},
                {id: 2, name: "Biologiczny", schoolId: 1, capacity: 20}
            ];
            const mockProfiles2 = [
                {id: 3, name: "Historyczny", schoolId: 2, capacity: 25}
            ];

            schoolRepoStub.getAll.resolves(mockSchools);
            profileServiceStub.getProfilesBySchool.withArgs(1).resolves(mockProfiles1);
            profileServiceStub.getProfilesBySchool.withArgs(2).resolves(mockProfiles2);

            const result = await schoolService.getAllSchoolsWithProfiles();

            assert.deepStrictEqual(result, [
                {id: 1, name: 'School 1', profiles: mockProfiles1},
                {id: 2, name: 'School 2', profiles: mockProfiles2},
            ]);
            assert.equal(schoolRepoStub.getAll.callCount, 1);
            assert.equal(profileServiceStub.getProfilesBySchool.callCount, 2);
        });
    });

    describe('getSchoolWithProfiles', async () => {
        it('should return a school with its profiles when the school exists', async () => {
            const mockSchool: SchoolEntity = {id: 1, name: 'School 1'};

            const mockProfiles = [
                {id: 1, name: "Informatyczny", schoolId: 1, capacity: 20},
                {id: 2, name: "Biologiczny", schoolId: 1, capacity: 20}
            ];


            schoolRepoStub.getById.resolves(mockSchool);
            profileServiceStub.getProfilesBySchool.resolves(mockProfiles);

            const result = await schoolService.getSchoolWithProfiles(1);

            assert.deepStrictEqual(result, {id: 1, name: 'School 1', profiles: mockProfiles});
            assert.equal(schoolRepoStub.getById.callCount, 1);
            assert.equal(profileServiceStub.getProfilesBySchool.callCount, 1);
        })

        it('should throw an error when the school does not exist', async () => {
            schoolRepoStub.getById.resolves(null);

            try {
                await schoolService.getSchoolWithProfiles(2);
                assert.fail('Expected an error to be thrown');
            } catch (err) {
                assert(err instanceof ResourceNotFoundError);
                assert.equal((err as ResourceNotFoundError).message, 'School not found.');
            }

            assert.equal(schoolRepoStub.getById.callCount, 1);
            assert.equal(profileServiceStub.getProfilesBySchool.callCount, 0);
        });
    })

    describe('addSchool', () => {
        it('should add a new school and returned it', async () => {
            const newSchool = {name: 'School Name'};

            await schoolService.addSchool('School Name');

            assert.equal(schoolRepoStub.insert.callCount, 1);
            assert(schoolRepoStub.insert.calledWithMatch(newSchool));
        });
    });
})*/
