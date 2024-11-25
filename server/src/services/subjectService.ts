import {Subject} from "../models/subjectModel";
import {SubjectRepository} from "../repositories/subjectRepository";

export class SubjectService {
    constructor(private subjectRepository: SubjectRepository) {
        this.subjectRepository = subjectRepository;
    }

    async getAllSubjects(): Promise<Subject[]> {
        return this.subjectRepository.getAll();
    }
}