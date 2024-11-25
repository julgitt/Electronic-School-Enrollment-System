import { NextFunction, Request, Response } from 'express';

import {SubjectService} from "../services/subjectService";

export class SubjectController {
    constructor(private subjectService: SubjectService) {
        this.subjectService = subjectService;
    }

    async getAllSubjects(req: Request, res: Response, next: NextFunction) {
        try {
            const subjects = await this.subjectService.getAllSubjects();
            return res.status(201).json(subjects);
        } catch (error) {
            return next(error);
        }
    }
}