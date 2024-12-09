import {NextFunction, Request, Response} from 'express';

import {GradeService} from "../services/gradeService";
import {GradeRequest} from "../dto/gradeRequest";


export class GradeController {
    constructor(private gradeService: GradeService) {}

    async submitGrades(req: Request, res: Response, next: NextFunction) {
        try {
            const grades: GradeRequest[] = req.body;
            const candidateId: number = req.signedCookies.candidateId;
            await this.gradeService.submitGrades(grades, candidateId);
            return res.status(201).json({message: "Grades submission successful", redirect: "/"});
        } catch (error) {
            return next(error);
        }
    }

    async checkIfGradesSubmitted(req: Request, res: Response, next: NextFunction) {
        try {
            const candidateId: number = req.signedCookies.candidateId;
            const isSubmitted: boolean = await this.gradeService.checkIfGradesSubmitted(candidateId);
            return res.status(200).json({gradesSubmitted: isSubmitted});
        } catch (error) {
            return next(error);
        }
    }
}