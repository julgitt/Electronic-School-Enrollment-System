import {SubjectRepository} from "../repositories/subjectRepository";
import {Subject} from "../dto/subject";
import {ResourceNotFoundError} from "../errors/resourceNotFoundError";

export class SubjectService {
    constructor(private subjectRepository: SubjectRepository) {
    }

    async getSubject(id: number): Promise<Subject> {
        const subject = await this.subjectRepository.getById(id);
        if (!subject) throw new ResourceNotFoundError("Nie znaleziono przedmiotu");
        return subject;
    }

    async getAllSubjects(): Promise<Subject[]> {
        return this.subjectRepository.getAll();
    }
}