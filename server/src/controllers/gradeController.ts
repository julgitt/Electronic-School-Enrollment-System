import { NextFunction, Request, Response } from 'express';

import {GradeService} from "../services/gradeService";
import {GradeSubmission} from "../types/gradeSubmission";

export class GradeController {
    constructor(private gradeService: GradeService) {
        this.gradeService = gradeService;
    }

    async submitGrades(req: Request, res: Response, next: NextFunction) {
        try {
            const { grades }: {grades: GradeSubmission[]} = req.body;
            const candidateId = req.signedCookies.candidateId;
            await this.gradeService.submitGrades(grades, candidateId);
            return res.status(201).json({ message: "Grades submission successful", redirect: "/"});
        } catch (error) {
            return next(error);
        }
    }
}