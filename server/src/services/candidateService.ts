import {CandidateRepository} from "../repositories/candidateRepository";
import {DataConflictError} from "../errors/dataConflictError";
import {ResourceNotFoundError} from "../errors/resourceNotFoundError";
import {GradeService} from "./gradeService";
import {Grade} from "../dto/grade/grade";
import {Candidate} from "../dto/candidate/candidate";
import {CandidateEntity} from "../models/candidateEntity";
import {CandidateRequest} from "../dto/candidate/candidateRequest";
import {GradeByCandidate} from "../dto/grade/gradesByCandidate";

export class CandidateService {
    constructor(
        private readonly gradeService: GradeService,
        private readonly candidateRepository: CandidateRepository) {
    }

    async getGradesByCandidates(): Promise<GradeByCandidate> {
        const gradesByCandidateId = new Map<number, Grade[]>;
        const candidates: Candidate[] = await this.candidateRepository.getAll();
        for (const candidate of candidates) {
            gradesByCandidateId.set(candidate.id, await this.gradeService.getAllByCandidate(candidate.id));
        }
        return gradesByCandidateId;
    }

    async getLastCreatedCandidateByUser(userId: number) {
        return this.candidateRepository.getLastUpdatedByUser(userId);
    }

    async getCandidate(id: number, userId: number) {
        const candidate: Candidate | null = await this.candidateRepository.getById(id);
        if (candidate == null || candidate.userId != userId) {
            throw new ResourceNotFoundError('Nie znaleziono kandydata.');
        }
        return candidate;
    }

    async deleteCandidate(id: number, userId: number) {
        await this.getCandidate(id, userId);
        await this.candidateRepository.deleteById(id);
    }

    async getAllByUser(userId: number): Promise<Candidate[]> {
        return this.candidateRepository.getAllByUser(userId);
    }

    async register(userId: number, candidate: CandidateRequest): Promise<Candidate> {
        const existingCandidate: Candidate | null = await this.candidateRepository.getByPesel(candidate.pesel);
        if (existingCandidate) {
            throw new DataConflictError('Już istnieje kandydat z tym numerem pesel.');
        }

        const newCandidate: CandidateEntity = {
            id: 0,
            userId,
            firstName: candidate.firstName,
            lastName: candidate.lastName,
            pesel: candidate.pesel,
        };

        return await this.candidateRepository.insert(newCandidate);
    }
}
