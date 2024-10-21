import assert from 'assert';
import { afterEach } from 'mocha';
import sinon from 'sinon';

import { SchoolService } from "../../../src/services/schoolService";
import { SchoolRepository } from "../../../src/repositories/schoolRepository";
import {School} from "../../../src/models/schoolModel";

describe('SchoolService', () => {
    let schoolService: SchoolService;
    let schoolRepoStub: sinon.SinonStubbedInstance<SchoolRepository>;

    beforeEach(() => {
        schoolRepoStub = sinon.createStubInstance(SchoolRepository);

        schoolService = new SchoolService();
        schoolService.schoolRepository = schoolRepoStub;
    });

    afterEach(() => { sinon.restore(); })

    describe('getAllSchools', () => {
        it('should return a list of schools', async () => {
            const mockSchools: School[] = [
                {id: 1, name: 'School 1', enrollmentLimit: 100},
                {id: 2, name: 'School 2', enrollmentLimit: 150}
            ];
            schoolRepoStub.getAll.resolves(mockSchools);

            const result = await schoolService.getAllSchools();

            assert.deepEqual(result, mockSchools);
            assert.equal(schoolRepoStub.getAll.callCount, 1);
        });
    });

    describe('addSchool', () => {
        it('should add a new school and returned it', async () => {
            const newSchool = {name: 'School Name', enrollmentLimit: 100};
            const mockInsertedSchool: School = {id: 1, ...newSchool};

            await schoolService.addSchool('School Name', 100);

            assert.equal(schoolRepoStub.insert.callCount, 1);
            assert(schoolRepoStub.insert.calledWith(newSchool));
        });
    });
})