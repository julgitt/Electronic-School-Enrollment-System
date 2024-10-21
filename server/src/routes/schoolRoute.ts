import { Router, Request, Response, NextFunction } from 'express';

import { authorize } from "../middlewares/authorize";
import {SchoolRepository} from "../repositories/schoolRepository";
import {SchoolService} from "../services/schoolService";
import {SchoolController} from "../controllers/schoolController";

const schoolRepository: SchoolRepository = new SchoolRepository();
const schoolService: SchoolService = new SchoolService(schoolRepository);
const schoolController = new SchoolController(schoolService);

const router = Router();

router.get('/schools', authorize('user'), async (req: Request, res: Response, next: NextFunction) => {
    return await schoolController.getAllSchools(req, res, next);
});



export default router;