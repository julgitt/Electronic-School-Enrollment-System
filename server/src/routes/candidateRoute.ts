import {NextFunction, Router, Request, Response} from 'express';

import { candidateRegisterValidator } from '../validators/candidateValidator';
import { handleValidationErrors } from '../middlewares/validationErrorHandler';

import { CandidateRepository } from "../repositories/candidateRepository";
import { CandidateService } from "../services/candidateService";
import { CandidateController } from '../controllers/candidateController';


const candidateRepository: CandidateRepository = new CandidateRepository();
const candidateService: CandidateService = new CandidateService(candidateRepository);
const candidateController = new CandidateController(candidateService);

const router = Router();

router.post('/registerCandidate', candidateRegisterValidator, handleValidationErrors, async (req: Request, res: Response, next: NextFunction) => {
    return await candidateController.register(req, res, next);
});

router.post('/switchCandidate', async (req: Request, res: Response, next: NextFunction) => {
    return await candidateController.switchCandidate(req, res, next);
});

router.get('/candidate', async (req: Request, res: Response, next: NextFunction) => {
    return await candidateController.getCandidate(req, res, next);
});

export default router;
