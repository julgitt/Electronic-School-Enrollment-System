import { CandidateRepository } from "../repositories/candidateRepository";
import {DataConflictError} from "../errors/dataConflictError";
import {ResourceNotFoundError} from "../errors/resourceNotFoundError";
import {Candidate} from "../models/candidateModel";
import {Grade} from "../models/gradeModel";
import {GradeService} from "./gradeService";

export class CandidateService {
    constructor(
        private readonly gradeService: GradeService,
        private readonly candidateRepository: CandidateRepository) {}

    async getAllWithGrades() {
        const gradesByCandidateId = new Map<number, Grade[]>;
        const candidates = await this.candidateRepository.getAll();
        for (const candidate of candidates) {
            gradesByCandidateId.set(candidate.id, await this.gradeService.getAllByCandidate(candidate.id));
        }
        return gradesByCandidateId;
    }

    async getLastCreatedCandidateByUser(userId: number) {
        return this.candidateRepository.getLastUpdatedByUser(userId);
    }

    async getCandidate(id: number, userId: number) {
        const candidate = await this.candidateRepository.getById(id);
        if (candidate == null || candidate.userId !== userId) {
            throw new ResourceNotFoundError('Candidate not found.');
        }
        return candidate;
    }

    async getAllByUser(userId: number) {
        return this.candidateRepository.getAllByUser(userId);
    }

    async register(userId: number, firstName: string, lastName: string, pesel: string): Promise<Candidate> {
        const existingCandidate = await this.candidateRepository.getByPesel(pesel);
        if (existingCandidate) {
            throw new DataConflictError('There is already candidate with that pesel.');
        }

        const newCandidate: Candidate = {
            id: 0,
            userId,
            firstName,
            lastName,
            pesel,
        };

        return await this.candidateRepository.insert(newCandidate);
    }
}
