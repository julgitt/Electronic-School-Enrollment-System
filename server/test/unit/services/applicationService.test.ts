import assert from 'assert';
import { afterEach } from 'mocha';
import sinon from 'sinon';

import { ApplicationService } from "../../../src/services/applicationService";
import { ApplicationRepository } from "../../../src/repositories/applicationRepository";
import { SchoolRepository } from "../../../src/repositories/schoolRepository";
import { Application } from "../../../src/models/applicationModel";
import { School } from "../../../src/models/schoolModel";

describe('ApplicationService', () => {
    let appService: ApplicationService;
    let appRepoStub: sinon.SinonStubbedInstance<ApplicationRepository>;
    let schoolRepoStub: sinon.SinonStubbedInstance<SchoolRepository>;

    beforeEach(() => {
        appRepoStub = sinon.createStubInstance(ApplicationRepository);
        schoolRepoStub = sinon.createStubInstance(SchoolRepository);

        appService = new ApplicationService(appRepoStub, schoolRepoStub);
    });

    afterEach(() => { sinon.restore(); })

    describe('AddApplication', () => {

        it('should add applications when all schools exist', async () => {
            schoolRepoStub.getSchoolById.resolves({} as School);

            appRepoStub.insertApplication.resolves({} as Application);

            const result = await appService.addApplication(
                'Name', 'Surname', '12345678901', [1, 2, 3], 1
            );

            assert.equal(result.length, 3);

            assert.equal(appRepoStub.insertApplication.callCount, 3);

            assert.equal(schoolRepoStub.getSchoolById.callCount, 3);
        });

        it('should throw an error if a school is not found', async () => {
            schoolRepoStub.getSchoolById.resolves({} as School);
            schoolRepoStub.getSchoolById.withArgs(2).resolves(null);

            try {
                await appService.addApplication(
                    'Name', 'Surname', '12345678901', [1, 2, 3], 1
                );
                assert.fail('Expected an error to be thrown');
            } catch (err) {
                assert.equal((err as Error).message, 'School name is not recognized.')
            }

            assert.equal(schoolRepoStub.getSchoolById.callCount, 2, "getSchools() call count differ.");
            assert.equal(appRepoStub.insertApplication.callCount, 0, "insertApplication() call count differ.");
        });

        it('should call insertApplication with correct arguments', async () => {
            schoolRepoStub.getSchoolById.resolves({} as School);
            appRepoStub.insertApplication.resolves({} as Application);

            await appService.addApplication('Name', 'Surname', '12345678901', [1], 1);

            assert(appRepoStub.insertApplication.calledWithMatch({
                userId: 1,
                schoolId: 1,
                firstName: 'Name',
                lastName: 'Surname',
                pesel: '12345678901',
                stage: 1,
                status: 'pending',
            }));
        });
    });
})