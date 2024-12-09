import {NextFunction, Request, Response, Router} from 'express';

import {gradeController} from "../dependencyContainer";
import {gradesValidator} from '../validators/gradesValidator';
import {handleValidationErrors} from '../middlewares/validationErrorHandler';
import {authorize} from "../middlewares/authorize";


const router = Router();

router.post('/submitGrades', authorize("user"), gradesValidator, handleValidationErrors, async (req: Request, res: Response, next: NextFunction) => {
    return await gradeController.submitGrades(req, res, next);
});

router.get('/submitGrades', authorize("user"), async (_req: Request, res: Response, _next: NextFunction) => {
    return res.status(200).json({message: 'Authorized'});
});

router.get('/gradesSubmitted', authorize("user"), async (req: Request, res: Response, next: NextFunction) => {
    return await gradeController.checkIfGradesSubmitted(req, res, next);
});

export default router;
