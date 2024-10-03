import { Router, Request, Response } from 'express';
import { applicationValidator } from "../validators/applicationValidator";

import { authorize } from "../middlewares/authorize";
import { ApplicationController } from "../controllers/applicationController";
import { ApplicationService } from "../services/applicationService";
import { SchoolRepository } from '../repositories/schoolRepository';
import { ApplicationRepository } from "../repositories/applicationRepository";

const router = Router();

const applicationRepository: ApplicationRepository = new ApplicationRepository();
const schoolRepository: SchoolRepository = new SchoolRepository();
const applicationService: ApplicationService = new ApplicationService(applicationRepository, schoolRepository);
const applicationCtrl = new ApplicationController(applicationService);

router.get('/apply', authorize('user'), (_req: Request, res: Response) => {
    return res.status(200).send({ message: 'Authorization successful'});
});

router.post('/apply', authorize('user'),  applicationValidator, async (req: Request, res: Response) => {
    return await applicationCtrl.addApplication(req, res);
});

export default router;
