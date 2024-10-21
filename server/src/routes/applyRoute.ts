import { Router, Request, Response } from 'express';

import { tx } from "../db"
import { applicationValidator } from "../validators/applicationValidator";
import { authorize } from "../middlewares/authorize";
import { asyncHandler } from '../middlewares/asyncHandler';
import { handleValidationErrors } from "../middlewares/validationMiddleware";

import { ApplicationRepository} from "../repositories/applicationRepository";
import { SchoolRepository } from "../repositories/schoolRepository";
import { ApplicationService } from "../services/applicationService";
import {ApplicationController} from "../controllers/applicationController";


const applicationRepository: ApplicationRepository = new ApplicationRepository();
const schoolRepository: SchoolRepository = new SchoolRepository();
const applicationService: ApplicationService = new ApplicationService(applicationRepository, schoolRepository, tx);
const applicationController = new ApplicationController(applicationService);

const router = Router();

router.get('/apply', authorize('user'), asyncHandler((_req: Request, res: Response) => {
    return res.status(200).send({ message: 'Authorization successful' });
}));

router.post('/apply', authorize('user'), applicationValidator, handleValidationErrors, asyncHandler(applicationController.addApplication));

export default router;
