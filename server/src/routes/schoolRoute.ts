import { Router, Request, Response, NextFunction } from 'express';

import { authorize } from "../middlewares/authorize";
import { SchoolRepository } from "../repositories/schoolRepository";
import { SchoolService } from "../services/schoolService";
import { SchoolController } from "../controllers/schoolController";
import {ProfileRepository} from "../repositories/profileRepository";

const schoolRepository: SchoolRepository = new SchoolRepository();
const profileRepository: ProfileRepository = new ProfileRepository();
const schoolService: SchoolService = new SchoolService(schoolRepository, profileRepository);
const schoolController = new SchoolController(schoolService);

const router = Router();

router.get('/schools', authorize('user'), async (req: Request, res: Response, next: NextFunction) => {
    return await schoolController.getAllSchoolsWithProfiles(req, res, next);
});

export default router;