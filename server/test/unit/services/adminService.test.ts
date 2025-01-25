import {afterEach} from 'mocha';
import sinon from 'sinon';

import {AdminService} from "../../../src/services/adminService";
import {ITask} from "pg-promise";
import {ApplicationService} from "../../../src/services/applicationService";
import assert from "assert";
import {EnrollmentLists, RankedApplication, RankListWithInfo} from "../../../src/dto/application/rankedApplication";
import {ProfileWithInfo} from "../../../src/dto/profile/profileInfo";
import {ApplicationWithInfo} from "../../../src/dto/application/applicationWithInfo";
import { RankListService } from '../../../src/services/rankListService';

describe('AdminService', () => {
    let adminService: AdminService;
    let rankListServiceStub: sinon.SinonStubbedInstance<RankListService>;
    let applicationServiceStub: sinon.SinonStubbedInstance<ApplicationService>;
    let txStub: sinon.SinonStub;

    beforeEach(() => {
        applicationServiceStub = sinon.createStubInstance(ApplicationService);
        rankListServiceStub = sinon.createStubInstance(RankListService);
        txStub = sinon.stub().callsFake(async (callback: (t: ITask<any>) => Promise<void>) => {
            await callback({} as unknown as ITask<any>);
        })

        adminService = new AdminService(
            rankListServiceStub,
            applicationServiceStub,
            txStub
        );
    });

    afterEach(() => {
        sinon.restore();
    })

    describe('processProfileEnrollments', () => {
        it('should process profile enrollments successfully', async () => {
            const mockRankLists = {
                accepted: [
                    {candidate: {id: 1}, priority: 2, profile: {id: 1}} as ApplicationWithInfo,
                    {candidate: {id: 2}, priority: 2, profile: {id: 2}} as ApplicationWithInfo,
                    {candidate: {id: 1}, priority: 1, profile: {id: 2}} as ApplicationWithInfo,
                ],
                rejected: [],
                reserveByProfile: new Map([
                    [1, [
                        {candidate: {id: 2}, priority: 1, profile: {id: 1}} as ApplicationWithInfo,
                        {candidate: {id: 3}, priority: 1, profile: {id: 1}} as ApplicationWithInfo
                    ]], 
                    [2, []]
                ]),
                acceptedByCandidate: new Map<number, ApplicationWithInfo>
            } as EnrollmentLists   
          
            rankListServiceStub.getEnrollmentLists.resolves(mockRankLists);


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
