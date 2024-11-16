import { CandidateRepository } from "../repositories/candidateRepository";
import {DataConflictError} from "../errors/dataConflictError";
import {Candidate} from "../models/candidateModel";
import {ResourceNotFoundError} from "../errors/resourceNotFoundError";

export class CandidateService {
    constructor(private candidateRepository: CandidateRepository) {}

    async getLastCreatedByUserId(userId: number) {
        return this.candidateRepository.getLastUpdatedByUserId(userId);
    }

    async getByIdAndUserId(id: number, userId: number) {
        const candidate = await this.candidateRepository.getByIdAndUserId(id, userId);
        if (candidate == null) {
            throw new ResourceNotFoundError('Candidate not found.');
        }
        return candidate;
    }

    async getAllByUserId(userId: number) {
        return this.candidateRepository.getAllByUserId(userId);
    }

    async register(userId: number, firstName: string, lastName: string, pesel: string): Promise<Candidate> {
        const existingCandidate = await this.candidateRepository.getByPesel(pesel);
        if (existingCandidate) {
            throw new DataConflictError('There is already candidate with that pesel.');
        }

        const newCandidate: Candidate = {
            userId,
            firstName,
            lastName,
            pesel,
        };

        return await this.candidateRepository.insert(newCandidate);
    }
}
