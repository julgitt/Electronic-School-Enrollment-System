import {Router, Request, Response, NextFunction} from 'express';

import { tx } from "../db"
import { applicationValidator } from "../validators/applicationValidator";
import { authorize } from "../middlewares/authorize";
import { handleValidationErrors } from "../middlewares/validationErrorHandler";

import { ApplicationRepository} from "../repositories/applicationRepository";
import { SchoolRepository } from "../repositories/schoolRepository";
import { ApplicationService } from "../services/applicationService";
import {ApplicationController} from "../controllers/applicationController";


const applicationRepository: ApplicationRepository = new ApplicationRepository();
const schoolRepository: SchoolRepository = new SchoolRepository();
const applicationService: ApplicationService = new ApplicationService(applicationRepository, schoolRepository, tx);
const applicationController = new ApplicationController(applicationService);

const router = Router();

router.get('/apply', authorize('user'), (_req: Request, res: Response) => {
    return res.status(200).send({ message: 'Authorization successful'});
});

router.post('/apply', authorize('user'), applicationValidator, handleValidationErrors, async (req: Request, res: Response, next: NextFunction) => {
    return await applicationController.addApplication(req, res, next)
});

export default router;
