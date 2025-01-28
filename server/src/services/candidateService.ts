import {CandidateRepository} from "../repositories/candidateRepository";
import {DataConflictError} from "../errors/dataConflictError";
import {ResourceNotFoundError} from "../errors/resourceNotFoundError";
import {Candidate} from "../dto/candidate/candidate";
import {CandidateEntity} from "../models/candidateEntity";
import {CandidateRequest} from "../dto/candidate/candidateRequest";
import {GradeService} from "./gradeService";
import {CandidateWithGrades} from "../dto/candidate/candidateWithGrades";

export class CandidateService {
    constructor(
        private readonly candidateRepository: CandidateRepository,
        private readonly gradeService: GradeService
    ) {
    }

    async getLastCreatedCandidateByUser(userId: number) {
        return this.candidateRepository.getLastUpdatedByUser(userId);
    }

    /**
     * Pobiera dane kandydata na podstawie identyfikatora kandydata oraz identyfikatora opiekuna
     *
     * @param {number} id - identyfikator kandydata.
     * @param {number} userId - identyfikator opiekuna kandydata.
     * @returns {Promise<Candidate>} Zwraca obiekt kandydata, zawierający:
     *
     *  id: number - identyfikator kandydata
     *  userId: number - identyfikator opiekuna kandydata
     *  firstName: string - imię kandydata
     *  lastName: string - nazwisko kandydata
     *
     * @throws {ResourceNotFoundError} Jeśli nie znaleziono kandydata o podanym identyfikatorze lub kandydat należy do innego opiekuna.
     */
    async getCandidate(id: number, userId: number): Promise<Candidate> {
        const candidate: Candidate | null = await this.candidateRepository.getById(id);
        if (candidate == null || candidate.userId != userId) {
            throw new ResourceNotFoundError('Nie znaleziono kandydata.');
        }
        return candidate;
    }


    /**
     * Pobiera wszystkich kandydatów wraz z ocenami.
     *
     * @returns {Promise<CandidateWithGrades[]>} Zwraca tablicę obiektów zawierających kandydata i jego oceny:
     */
    async getAllWithGrades(): Promise<CandidateWithGrades[]> {
        const candidates: Candidate[] = await this.candidateRepository.getAll();
        return Promise.all(
            candidates.map(async c => {
                const grades = await this.gradeService.getAllByCandidate(c.id);
                return {candidate: c, grades};
            })
        );
    }

    /**
     * Pobiera dane kandydata na podstawie identyfikatora
     *
     * @param {number} id - identyfikator kandydata.
     * @returns {Promise<Candidate>} Zwraca obiekt kandydata, zawierający:
     *
     *  id: number - identyfikator kandydata
     *  userId: number - identyfikator opiekuna kandydata
     *  firstName: string - imię kandydata
     *  lastName: string - nazwisko kandydata
     *
     * @throws {ResourceNotFoundError} Jeśli nie znaleziono kandydata o podanym identyfikatorze.
     */
    async getCandidateById(id: number): Promise<Candidate> {
        const candidate: Candidate | null = await this.candidateRepository.getById(id);
        if (candidate == null) {
            throw new ResourceNotFoundError('Nie znaleziono kandydata.');
        }
        return candidate;
    }


    /**
     * Usuwa kandydata z bazy danych na podstawie identyfikatora kandydata oraz identyfikatora opiekuna
     *
     * @param {number} id - identyfikator kandydata.
     * @param {number} userId - identyfikator opiekuna.
     * @returns {Promise<void>}
     *
     * @throws {ResourceNotFoundError} Jeśli nie znaleziono kandydata o podanym identyfikatorze.
     */
    async deleteCandidate(id: number, userId: number): Promise<void> {
        await this.getCandidate(id, userId);
        await this.candidateRepository.deleteById(id);
    }

    /**
     * Pobiera wszystkich kandydatów należących do podanego użytkownika - opiekuna
     *
     * @param {number} userId - identyfikator opiekuna.
     * @returns {Promise<Candidate>} Zwraca tablicę obiektów kandydata
     */
    async getAllByUser(userId: number): Promise<Candidate[]> {
        return this.candidateRepository.getAllByUser(userId);
    }


    /**
     * Dodaje nowego kandydata do bazy danych.
     *
     * @param {number} userId - identyfikator opiekuna.
     * @param {CandidateRequest} candidate - obiekt kandydata zawierający:
     *
     *   firstName: string - imię
     *   lastName: string - nazwisko
     *   pesel: string - pesel
     * @returns {Promise<Candidate>} Zwraca obiekt kandydata, zawierający:
     *
     *  id: number - identyfikator kandydata
     *  userId: number - identyfikator opiekuna kandydata
     *  firstName: string - imię kandydata
     *  lastName: string - nazwisko kandydata
     *
     * @throws {DataConflictError} Jeśli istnieje już kandydat z podanym numerem pesel.
     */
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
