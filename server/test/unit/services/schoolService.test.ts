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

        schoolService = new SchoolService(schoolRepoStub);
    });

    afterEach(() => { sinon.restore(); })

    describe('getAllSchools', () => {
        it('should return a list of schools', async () => {
            const mockSchools: School[] = [
                {id: 1, name: 'School 1', enrollmentLimit: 100},
                {id: 2, name: 'School 2', enrollmentLimit: 150}
            ];
            schoolRepoStub.getAllSchools.resolves(mockSchools);

            const result = await schoolService.getAllSchools();

            assert.deepEqual(result, mockSchools);
            assert.equal(schoolRepoStub.getAllSchools.callCount, 1);
        });
    });

    describe('addSchool', () => {
        it('should add a new school and returned it', async () => {
            const newSchool = {name: 'School Name', enrollmentLimit: 100};
            const mockInsertedSchool: School = {id: 1, ...newSchool};
            schoolRepoStub.insertSchool.resolves(mockInsertedSchool);

            const result = await schoolService.addSchool('School Name', 100);

            assert.deepEqual(result, mockInsertedSchool);
            assert.equal(schoolRepoStub.insertSchool.callCount, 1);
            assert(schoolRepoStub.insertSchool.calledWith(newSchool));
        });
    });
})