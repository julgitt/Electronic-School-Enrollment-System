import assert from 'assert';
import { afterEach } from 'mocha';
import sinon from 'sinon';

import { ApplicationService } from "../../../src/services/applicationService";
import { ApplicationRepository } from "../../../src/repositories/applicationRepository";
import { SchoolRepository } from "../../../src/repositories/schoolRepository";
import { School } from "../../../src/models/schoolModel";
import { ITask } from "pg-promise";

describe('ApplicationService', () => {
    let appService: ApplicationService;
    let appRepoStub: sinon.SinonStubbedInstance<ApplicationRepository>;
    let schoolRepoStub: sinon.SinonStubbedInstance<SchoolRepository>;
    let txStub: sinon.SinonStub;

    beforeEach(() => {
        appRepoStub = sinon.createStubInstance(ApplicationRepository);
        schoolRepoStub = sinon.createStubInstance(SchoolRepository);
        txStub = sinon.stub().callsFake(async (callback: (t: ITask<any>) => Promise<void>) => {
            await callback({} as unknown as ITask<any>);
        })

        appService = new ApplicationService();
        appService.applicationRepository = appRepoStub;
        appService.schoolRepository = schoolRepoStub;
        appService.tx = txStub;
    });

    afterEach(() => { sinon.restore(); })

    describe('AddApplication', () => {

        it('should add applications when all schools exist', async () => {
            schoolRepoStub.getById.resolves({} as School);

            appRepoStub.insert.resolves()

            await appService.addApplication(
                'Name', 'Surname', '12345678901', [1, 2, 3], 1
            );


            assert.equal(appRepoStub.insert.callCount, 3);

            assert.equal(schoolRepoStub.getById.callCount, 3);
        });

        it('should throw an error if a school is not found', async () => {
            schoolRepoStub.getById.resolves({} as School);
            schoolRepoStub.getById.withArgs(2).resolves(null);

            try {
                await appService.addApplication(
                    'Name', 'Surname', '12345678901', [1, 2, 3], 1
                );
                assert.fail('Expected an error to be thrown');
            } catch (err) {
                assert.equal((err as Error).message, 'School ID is not recognized.')
            }

            assert.equal(schoolRepoStub.getById.callCount, 2, "getSchools() call count differ.");
            assert.equal(appRepoStub.insert.callCount, 0, "insertApplication() call count differ.");
        });

        it('should call insertApplication with correct arguments', async () => {
            schoolRepoStub.getById.resolves({} as School);
            appRepoStub.insert.resolves();

            await appService.addApplication('Name', 'Surname', '12345678901', [1], 1);

            assert(appRepoStub.insert.calledWithMatch({
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