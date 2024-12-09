import {NextFunction, Request, Response} from 'express';

import {SubjectService} from "../services/subjectService";
import {Subject} from "../dto/subject";


export class SubjectController {
    constructor(private subjectService: SubjectService) {
    }

    async getAllSubjects(_req: Request, res: Response, next: NextFunction) {
        try {
            const subjects: Subject[] = await this.subjectService.getAllSubjects();
            return res.status(201).json(subjects);
        } catch (error) {
            return next(error);
        }
    }
}