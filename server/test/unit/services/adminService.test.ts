import {afterEach} from 'mocha';
import sinon from 'sinon';

import {AdminService} from "../../../src/services/adminService";
import {ITask} from "pg-promise";
import {ProfileService} from "../../../src/services/profileService";
import {ApplicationService} from "../../../src/services/applicationService";
import assert from "assert";
import {RankedApplication, RankListWithInfo} from "../../../src/dto/application/rankedApplication";
import {ProfileWithInfo} from "../../../src/dto/profile/profileInfo";
import {ApplicationWithInfo} from "../../../src/dto/application/applicationWithInfo";

describe('AdminService', () => {
    let adminService: AdminService;
    let profileServiceStub: sinon.SinonStubbedInstance<ProfileService>;
    let applicationServiceStub: sinon.SinonStubbedInstance<ApplicationService>;
    let txStub: sinon.SinonStub;

    beforeEach(() => {
        applicationServiceStub = sinon.createStubInstance(ApplicationService);
        profileServiceStub = sinon.createStubInstance(ProfileService);
        txStub = sinon.stub().callsFake(async (callback: (t: ITask<any>) => Promise<void>) => {
            await callback({} as unknown as ITask<any>);
        })

        adminService = new AdminService(
            profileServiceStub,
            applicationServiceStub,
            txStub
        );
    });

    afterEach(() => {
        sinon.restore();
    })

    describe('processProfileEnrollments', () => {
        it('should process profile enrollments successfully', async () => {
            const mockRankLists: Map<number, RankListWithInfo> = new Map([
                [1, {
                    profile: {id: 1} as ProfileWithInfo,
                    accepted: [{candidate: {id: 1}, priority: 2} as RankedApplication],
                    reserve: [
                        {candidate: {id: 2}, priority: 1} as RankedApplication,
                        {candidate: {id: 3}, priority: 1} as RankedApplication
                    ],
                    rejected: []
                }],
                [2, {
                    profile: {id: 2} as ProfileWithInfo,
                    accepted: [
                        {candidate: {id: 2}, priority: 2} as RankedApplication,
                        {candidate: {id: 1}, priority: 1} as RankedApplication
                    ],
                    reserve: [],
                    rejected: []
                }]
            ]);

            profileServiceStub.getAllRankLists.resolves(mockRankLists);


            const result: ApplicationWithInfo[] = await adminService.processProfileEnrollments();

            // then
            assert.deepEqual(result, [
                {
                    candidate: {id: 2},
                    priority: 1,
                    profile: {id: 1},
                    status: "Przyjęty"
                }, {
                    candidate: {id: 3},
                    priority: 1,
                    profile: {id: 1},
                    status: "Odrzucony"
                }, {
                    candidate: {id: 1},
                    priority: 2,
                    profile: {id: 1},
                    status: "Odrzucony"
                }, {
                    candidate: {id: 1},
                    priority: 1,
                    profile: {id: 2},
                    status: "Przyjęty"
                }, {
                    candidate: {id: 2},
                    priority: 2,
                    profile: {id: 2},
                    status: "Odrzucony"
                },
            ]);
        });
    });
})
