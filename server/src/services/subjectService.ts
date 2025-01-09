import {SubjectRepository} from "../repositories/subjectRepository";
import {Subject} from "../dto/subject";
import {ResourceNotFoundError} from "../errors/resourceNotFoundError";

export class SubjectService {
    constructor(private subjectRepository: SubjectRepository) {
    }

    /**
     *  Pobiera dane przedmiotu na podstawie identyfikatora.
     *
     * @param {number} id - identyfikator przedmiotu.
     * @returns {Promise<Subject>} Zwraca obiekt przedmiotu.
     *
     * @throws {ResourceNotFoundError} Jeśli nie znaleziono przedmiotu o podanym identyfikatorze.
     */
    async getSubject(id: number): Promise<Subject> {
        const subject = await this.subjectRepository.getById(id);
        if (!subject) throw new ResourceNotFoundError("Nie znaleziono przedmiotu");
        return subject;
    }

    /**
     *  Pobiera dane o wszystkich przedmiotach.
     *
     * @returns {Promise<Subject[]>} Zwraca tablicę z obiektami przedmiotów.
     */
    async getAllSubjects(): Promise<Subject[]> {
        return this.subjectRepository.getAll();
    }
}