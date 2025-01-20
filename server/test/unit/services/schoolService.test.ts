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
    let txStub: sinon.SinonStub;

    beforeEach(() => {
        schoolRepoStub = sinon.createStubInstance(SchoolRepository);
        profileServiceStub = sinon.createStubInstance(ProfileService);
        txStub = sinon.stub().callsFake(async (callback) => {
            await callback({});
        })

        schoolService = new SchoolService(schoolRepoStub, profileServiceStub, txStub);
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
            profileServiceStub.getAllProfilesBySchool.withArgs(1).resolves(mockProfiles1);
            profileServiceStub.getAllProfilesBySchool.withArgs(2).resolves(mockProfiles2);

            const result = await schoolService.getAllSchoolsWithProfiles();

            assert.deepStrictEqual(result, [
                {id: 1, name: 'School 1', profiles: mockProfiles1},
                {id: 2, name: 'School 2', profiles: mockProfiles2},
            ]);
            assert.equal(schoolRepoStub.getAll.callCount, 1);
            assert.equal(profileServiceStub.getAllProfilesBySchool.callCount, 2);
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
            profileServiceStub.getAllProfilesBySchool.resolves(mockProfiles);

            const result = await schoolService.getSchoolWithProfiles(1);

            assert.deepEqual(result, {id: 1, name: 'School 1', profiles: mockProfiles});
            assert.equal(schoolRepoStub.getById.callCount, 1);
            assert.equal(profileServiceStub.getAllProfilesBySchool.callCount, 1);
        })

        it('should throw an error when the school with profiles does not exist', async () => {
            schoolRepoStub.getById.resolves(null);

            await assert.rejects(
                () => schoolService.getSchoolWithProfiles(2),
                (err) => err instanceof ResourceNotFoundError && err.message === 'Szkoła nie znaleziona'
            );

            assert.equal(schoolRepoStub.getById.callCount, 1);
            assert.equal(profileServiceStub.getAllProfilesBySchool.callCount, 0);
        });
    })

    describe('getAllSchools', () => {
        it('should return a list of schools', async () => {
            const mockSchools: SchoolEntity[] = [
                {id: 1, name: 'School 1'},
                {id: 2, name: 'School 2'}
            ];

            schoolRepoStub.getAll.resolves(mockSchools);
            const result = await schoolService.getAllSchools();

            assert.deepEqual(result, [
                {id: 1, name: 'School 1'},
                {id: 2, name: 'School 2'},
            ]);
            assert.equal(schoolRepoStub.getAll.callCount, 1);
        });
    });

    describe('getSchool', async () => {
        it('should return a school when the school exists', async () => {
            const mockSchool: SchoolEntity = {id: 1, name: 'School 1'};

            schoolRepoStub.getById.resolves(mockSchool);

            const result = await schoolService.getSchool(1);

            assert.deepEqual(result, {id: 1, name: 'School 1'});
            assert.equal(schoolRepoStub.getById.callCount, 1);
        })

        it('should throw an error when the school does not exist', async () => {
            schoolRepoStub.getById.resolves(null);

            await assert.rejects(
                () => schoolService.getSchool(2),
                (err) => err instanceof ResourceNotFoundError && err.message === 'Nie znaleziono szkoły'
            );

            assert.equal(schoolRepoStub.getById.callCount, 1);
        });
    })

    describe('addSchool', async () => {
        it('should successfully add school', async () => {
            const mockSchool: SchoolEntity = {id: 1, name: 'School 1'};

            schoolRepoStub.insert.resolves();

            const result = await schoolService.addSchool(mockSchool);

            assert.equal(schoolRepoStub.insert.callCount, 1);
        })
    })

    describe('deleteSchool', async () => {
        it('should successfully delete school', async () => {
            schoolRepoStub.delete.resolves();

            const result = await schoolService.deleteSchool(1);

            assert.equal(schoolRepoStub.delete.callCount, 1);
        })
    })

    describe('getSchoolByAdminAndId', async () => {
        it('should return a school by id and admin id when the school exists', async () => {
            const mockSchool: SchoolEntity = {id: 1, name: 'School 1'};

            schoolRepoStub.getByIdAndAdmin.resolves(mockSchool);

            const result = await schoolService.getSchoolByAdminAndId(1, 1);

            assert.deepEqual(result, {id: 1, name: 'School 1'});
            assert.equal(schoolRepoStub.getByIdAndAdmin.callCount, 1);
        })
    })

    describe('getSchoolByAdmin', async () => {
        it('should return first school by admin id', async () => {
            const mockSchool: SchoolEntity = {id: 1, name: 'School 1'};

            schoolRepoStub.getFirstByAdmin.resolves(mockSchool);

            const result = await schoolService.getSchoolByAdmin(1);

            assert.deepEqual(result, {id: 1, name: 'School 1'});
            assert.equal(schoolRepoStub.getFirstByAdmin.callCount, 1);
        })
    })

    describe('getSchoolsByAdmin', async () => {
        it('should return schools with profiles by admin id', async () => {
            const mockSchools: SchoolEntity[] = [{id: 1, name: 'School 1'}];

            schoolRepoStub.getAllByAdmin.resolves(mockSchools);

            const result = await schoolService.getSchoolsByAdmin(1);

            assert.deepEqual(result, [{id: 1, name: 'School 1'}]);
            assert.equal(schoolRepoStub.getAllByAdmin.callCount, 1);
        })
    })

    describe('updateSchools', () => {
        it('should update schools', async () => {
            const mockExistingSchools: SchoolEntity[] = [
                {id: 1, name: 'School 1'},
                {id: 2, name: 'School 2'},
            ];

            schoolRepoStub.getAll.resolves(mockExistingSchools);

            await schoolService.updateSchools([
                /*{id: 1, name: 'School 1'}, - deleted*/
                {id: 2, name: 'School 1'}, // updated
                {id: 3, name: 'School 2'} // added
            ]);

            assert(schoolRepoStub.delete.calledWith(1))
            assert.equal(schoolRepoStub.delete.callCount, 1);

            assert(schoolRepoStub.update.calledWith({id: 2, name: 'School 1'}))
            assert.equal(schoolRepoStub.update.callCount, 1);

            assert(schoolRepoStub.insert.calledWith({id: 3, name: 'School 2'}))
            assert.equal(schoolRepoStub.insert.callCount, 1);
        });
    });


})