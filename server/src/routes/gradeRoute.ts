import {NextFunction, Router, Request, Response} from 'express';

import { tx } from "../db"
import { gradesValidator } from '../validators/gradesValidator';
import { handleValidationErrors } from '../middlewares/validationErrorHandler';


import {authorize} from "../middlewares/authorize";
import {GradeRepository} from "../repositories/gradeRepository";
import {GradeController} from "../controllers/gradeController";
import {GradeService} from "../services/gradeService";


const gradeRepository: GradeRepository = new GradeRepository();
const gradeService: GradeService = new GradeService(gradeRepository, tx);
const gradeController = new GradeController(gradeService);

const router = Router();

router.post('/submitGrades', authorize("user"),  gradesValidator, handleValidationErrors, async (req: Request, res: Response, next: NextFunction) => {
    return await gradeController.submitGrades(req, res, next);
});

router.get('/submitGrades', authorize("user"), async (_req: Request, res: Response, _next: NextFunction) => {
    return res.status(200).json({ message: 'Success' });
});

router.get('/gradesSubmitted', authorize("user"), async (req: Request, res: Response, next: NextFunction) => {
    return await gradeController.checkIfGradesSubmitted(req, res, next);
});

export default router;
