import assert from 'assert';
import {afterEach} from 'mocha';
import sinon from 'sinon';

import {ApplicationService} from "../../../src/services/applicationService";
import {ApplicationRepository} from "../../../src/repositories/applicationRepository";
import {ITask} from "pg-promise";
import {SchoolService} from "../../../src/services/schoolService";
import {ProfileService} from "../../../src/services/profileService";
import {SchoolWithProfiles} from "../../../src/dto/schoolWithProfiles";

describe('ApplicationService', () => {
    let appService: ApplicationService;
    let appRepoStub: sinon.SinonStubbedInstance<ApplicationRepository>;
    let schoolServiceStub: sinon.SinonStubbedInstance<SchoolService>;
    let profileServiceStub: sinon.SinonStubbedInstance<ProfileService>;
    let txStub: sinon.SinonStub;

    beforeEach(() => {
        appRepoStub = sinon.createStubInstance(ApplicationRepository);
        schoolServiceStub = sinon.createStubInstance(SchoolService);
        profileServiceStub = sinon.createStubInstance(ProfileService);
        txStub = sinon.stub().callsFake(async (callback: (t: ITask<any>) => Promise<void>) => {
            await callback({} as unknown as ITask<any>);
        })

        appService = new ApplicationService(appRepoStub, profileServiceStub, schoolServiceStub, txStub);
    });

    afterEach(() => {
        sinon.restore();
    })

    describe('addApplication', () => {

        it('should add applications when all schools exist', async () => {
            schoolServiceStub.getSchoolWithProfiles.resolves({} as SchoolWithProfiles);

            appRepoStub.insert.resolves()

            await appService.addApplication(
                [{profileId: 1, priority: 1}, {profileId: 2, priority: 2}, {profileId: 3, priority: 3}], 1
            );


            assert.equal(appRepoStub.insert.callCount, 3);

            assert.equal(schoolServiceStub.getSchoolWithProfiles.callCount, 3);
        });

        it('should throw an error if a school is not found', async () => {
            schoolServiceStub.getSchoolWithProfiles.resolves({} as SchoolWithProfiles);
            schoolServiceStub.getSchoolWithProfiles.withArgs(2).resolves(null);

            try {
                await appService.addApplication(
                    [{profileId: 1, priority: 1}, {profileId: 2, priority: 2}, {profileId: 3, priority: 3}], 1
                );
                assert.fail('Expected an error to be thrown');
            } catch (err) {
                assert.equal((err as Error).message, 'School ID is not recognized.')
            }

            assert.equal(schoolServiceStub.getSchoolWithProfiles.callCount, 2, "getSchools() call count differ.");
            assert.equal(appRepoStub.insert.callCount, 0, "insertApplication() call count differ.");
        });

        it('should call insertApplication with correct arguments', async () => {
            schoolServiceStub.getSchoolWithProfiles.resolves({} as SchoolWithProfiles);
            appRepoStub.insert.resolves();

            await appService.addApplication(
                [{profileId: 1, priority: 1}], 1
            );

            assert(appRepoStub.insert.calledWithMatch({
                candidateId: 1,
                profileId: 1,
                priority: 1,
                round: 1,
                status: 'pending',
            }));
        });
    });
    //TODO: update test

})