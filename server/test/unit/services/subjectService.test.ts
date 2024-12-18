/*
import assert from 'assert';
import {afterEach} from 'mocha';
import sinon from 'sinon';

import {SubjectService} from "../../../src/services/subjectService";
import {SubjectRepository} from "../../../src/repositories/subjectRepository";
import {SubjectEntity} from "../../../src/models/subjectEntity";

describe('SubjectService', () => {
    let subjectService: SubjectService;
    let subjectRepoStub: sinon.SinonStubbedInstance<SubjectRepository>;

    beforeEach(() => {
        subjectRepoStub = sinon.createStubInstance(SubjectRepository);
        subjectService = new SubjectService(subjectRepoStub);
    });

    afterEach(() => {
        sinon.restore();
    })

    describe('getAllSubjects', () => {

        it('should return all subjects', async () => {
            const mockSubjects: SubjectEntity[] = [
                {id: 1, name: "Matematyka", isExamSubject: true},
                {id: 2, name: "Historia", isExamSubject: false},
            ];

            subjectRepoStub.getAll.resolves(mockSubjects)

            const result = await subjectService.getAllSubjects();

            assert.equal(subjectRepoStub.getAll.callCount, 1);
            assert.deepEqual(result, mockSubjects);
        });

        it('should handle empty subject list', async () => {
            subjectRepoStub.getAll.resolves([]);

            const result = await subjectService.getAllSubjects();

            assert.deepEqual(result, []);
        });
    });
})*/
