import {NextFunction, Router, Request, Response} from 'express';

import { gradesValidator } from '../validators/gradesValidator';
import { handleValidationErrors } from '../middlewares/validationErrorHandler';

import { CandidateRepository } from "../repositories/candidateRepository";
import { CandidateService } from "../services/candidateService";
import { CandidateController } from '../controllers/candidateController';
import {authorize} from "../middlewares/authorize";


const candidateRepository: CandidateRepository = new CandidateRepository();
const candidateService: CandidateService = new CandidateService(candidateRepository);
const candidateController = new CandidateController(candidateService);

const router = Router();

router.post('/submitGrades', authorize("user"),  gradesValidator, handleValidationErrors, async (req: Request, res: Response, next: NextFunction) => {
    return await candidateController.getCandidate(req, res, next);
});

router.get('/submitGrades', authorize("user"), async (req: Request, res: Response, next: NextFunction) => {
    return res.status(200);
});

router.get('/grades', authorize("user"), async (req: Request, res: Response, next: NextFunction) => {
    return await candidateController.getAllCandidates(req, res, next);
});

export default router;
