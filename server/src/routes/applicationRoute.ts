import {Router, Request, Response, NextFunction} from 'express';

import { tx } from "../db"
import { applicationValidator } from "../validators/applicationValidator";
import { authorize } from "../middlewares/authorize";
import { handleValidationErrors } from "../middlewares/validationErrorHandler";

import { ApplicationRepository} from "../repositories/applicationRepository";
import { SchoolRepository } from "../repositories/schoolRepository";
import { ApplicationService } from "../services/applicationService";
import { ApplicationController } from "../controllers/applicationController";


const applicationRepository: ApplicationRepository = new ApplicationRepository();
const schoolRepository: SchoolRepository = new SchoolRepository();
const applicationService: ApplicationService = new ApplicationService(applicationRepository, schoolRepository, tx);
const applicationController = new ApplicationController(applicationService);

const router = Router();

router.get('/allApplications', authorize('user'), async (req: Request, res: Response, next: NextFunction) => {
    return await applicationController.getApplications(req, res, next)
});

router.put('/updateApplication', authorize('user'), async (req: Request, res: Response, next: NextFunction) => {
    return await applicationController.updateApplication(req, res, next)
});

//TODO:
router.get('/deadline', authorize('user'), async (_req: Request, res: Response, _next: NextFunction) => {
    return res.status(200).json(new Date('2025-12-24'));
});

router.post('/submitApplication', authorize('user'), applicationValidator, handleValidationErrors, async (req: Request, res: Response, next: NextFunction) => {
    return await applicationController.addApplication(req, res, next)
});

export default router;
