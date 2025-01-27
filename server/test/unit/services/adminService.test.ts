import {afterEach} from 'mocha';
import sinon from 'sinon';

import {AdminService} from "../../../src/services/adminService";
import {ITask} from "pg-promise";
import {ApplicationService} from "../../../src/services/applicationService";
import assert from "assert";
import {EnrollmentLists} from "../../../src/dto/application/rankedApplication";
import {ApplicationWithInfo} from "../../../src/dto/application/applicationWithInfo";
import {RankListService} from '../../../src/services/rankListService';
import {EnrollmentService} from "../../../src/services/enrollmentService";
import {ApplicationStatus} from "../../../src/dto/application/applicationStatus";

describe('AdminService', () => {
    let adminService: AdminService;
    let rankListServiceStub: sinon.SinonStubbedInstance<RankListService>;
    let applicationServiceStub: sinon.SinonStubbedInstance<ApplicationService>;
    let enrollmentServiceStub: sinon.SinonStubbedInstance<EnrollmentService>;
    let txStub: sinon.SinonStub;

    beforeEach(() => {
        applicationServiceStub = sinon.createStubInstance(ApplicationService);
        rankListServiceStub = sinon.createStubInstance(RankListService);
        enrollmentServiceStub = sinon.createStubInstance(EnrollmentService);
        txStub = sinon.stub().callsFake(async (callback: (t: ITask<any>) => Promise<void>) => {
            await callback({} as unknown as ITask<any>);
        })

        adminService = new AdminService(
            rankListServiceStub,
            applicationServiceStub,
            enrollmentServiceStub,
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
                    {id: 6, candidate: {id: 4}, priority: 1, profile: {id: 2}} as ApplicationWithInfo,
                    {id: 1, candidate: {id: 1}, priority: 2, profile: {id: 1}} as ApplicationWithInfo,
                    {id: 2, candidate: {id: 2}, priority: 2, profile: {id: 2}} as ApplicationWithInfo,
                    {id: 3, candidate: {id: 1}, priority: 1, profile: {id: 2}} as ApplicationWithInfo,
                ],
                rejected: [],
                reserveByProfile: new Map([
                    [1, [
                        {id: 4, candidate: {id: 2}, priority: 1, profile: {id: 1}} as ApplicationWithInfo,
                        {id: 5, candidate: {id: 3}, priority: 1, profile: {id: 1}} as ApplicationWithInfo
                    ]],
                    [2, []]
                ]),
                acceptedByCandidate: new Map<number, ApplicationWithInfo>
            } as EnrollmentLists

            rankListServiceStub.getEnrollmentLists.resolves(mockRankLists);

            const result: ApplicationWithInfo[] = await adminService.processProfileEnrollments();

            // then
            assert.deepEqual(result.sort((a, b) => a.id - b.id), [
                {
                    id: 4,
                    candidate: {id: 2},
                    priority: 1,
                    profile: {id: 1},
                    status: ApplicationStatus.Accepted
                }, {
                    id: 5,
                    candidate: {id: 3},
                    priority: 1,
                    profile: {id: 1},
                    status: ApplicationStatus.Rejected
                }, {
                    id: 1,
                    candidate: {id: 1},
                    priority: 2,
                    profile: {id: 1},
                    status: ApplicationStatus.Rejected
                }, {
                    id: 3,
                    candidate: {id: 1},
                    priority: 1,
                    profile: {id: 2},
                    status: ApplicationStatus.Accepted
                }, {
                    id: 2,
                    candidate: {id: 2},
                    priority: 2,
                    profile: {id: 2},
                    status: ApplicationStatus.Rejected
                }, {
                    candidate: {
                        id: 4
                    },
                    id: 6,
                    priority: 1,
                    profile: {
                        id: 2
                    },
                    status: ApplicationStatus.Accepted
                },
            ].sort((a, b) => a.id - b.id),);
            assert.equal(enrollmentServiceStub.endEnrollment.callCount, 1);
        });
    });
})
