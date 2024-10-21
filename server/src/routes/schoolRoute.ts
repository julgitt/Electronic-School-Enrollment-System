import { Router } from 'express';

import { authorize } from "../middlewares/authorize";
import { asyncHandler } from "../middlewares/asyncHandler";
import {SchoolRepository} from "../repositories/schoolRepository";
import {SchoolService} from "../services/schoolService";
import {SchoolController} from "../controllers/schoolController";

const schoolRepository: SchoolRepository = new SchoolRepository();
const schoolService: SchoolService = new SchoolService(schoolRepository);
const schoolController = new SchoolController(schoolService);

const router = Router();

router.get('/schools', authorize('user'), asyncHandler(schoolController.getAllSchools));


export default router;