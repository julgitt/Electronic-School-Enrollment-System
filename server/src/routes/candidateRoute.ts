import {NextFunction, Request, Response, Router} from 'express';

import {candidateController} from '../dependencyContainer'
import {candidateRegisterValidator} from '../validators/candidateValidator';
import {handleValidationErrors} from '../middlewares/validationErrorHandler';
import {authorize} from "../middlewares/authorize";


const router = Router();

router.post('/registerCandidate', authorize('user'), candidateRegisterValidator, handleValidationErrors, async (req: Request, res: Response, next: NextFunction) => {
    return await candidateController.register(req, res, next);
});

router.post('/switchCandidate', authorize('user'), async (req: Request, res: Response, next: NextFunction) => {
    return await candidateController.switchCandidate(req, res, next);
});

router.get('/candidate', authorize('user'), async (req: Request, res: Response, next: NextFunction) => {
    return await candidateController.getCandidate(req, res, next);
});

router.get('/candidates', authorize('user'), async (req: Request, res: Response, next: NextFunction) => {
    return await candidateController.getAllCandidates(req, res, next);
});

export default router;
