import {SubjectRepository} from "../repositories/subjectRepository";
import {Subject} from "../dto/subject";

export class SubjectService {
    constructor(private subjectRepository: SubjectRepository) {
        this.subjectRepository = subjectRepository;
    }

    async getAllSubjects(): Promise<Subject[]> {
        return this.subjectRepository.getAll();
    }
}