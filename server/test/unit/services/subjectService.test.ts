import assert from 'assert';
import {afterEach} from 'mocha';
import sinon from 'sinon';

import {SubjectService} from "../../../src/services/subjectService";
import {SubjectRepository} from "../../../src/repositories/subjectRepository";
import {SubjectEntity} from "../../../src/models/subjectEntity";
import {ResourceNotFoundError} from "../../../src/errors/resourceNotFoundError";

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

    describe('getSubject', () => {

        it('should return subject if exits', async () => {
            const mockSubject: SubjectEntity = {
                id: 1,
                name: "Matematyka",
                isExamSubject: true
            };

            subjectRepoStub.getById.resolves(mockSubject)

            const result = await subjectService.getSubject(1);

            assert.equal(subjectRepoStub.getById.callCount, 1);
            assert.deepEqual(result, mockSubject);
        });

        it('should throw error when try to get subject that does not exist', async () => {
            subjectRepoStub.getById.resolves(null);

            await assert.rejects(
                () => subjectService.getSubject(1),
                (err) => err instanceof ResourceNotFoundError && err.message === "Nie znaleziono przedmiotu"
            );
        });
    });
})
