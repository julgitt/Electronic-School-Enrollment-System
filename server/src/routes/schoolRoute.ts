import { Router } from 'express';

import { authorize } from "../middlewares/authorize";
import schoolController from "../controllers/schoolController";
import { asyncHandler } from "../middlewares/asyncHandler";

const router = Router();

router.get('/schools', authorize('user'), asyncHandler(schoolController.getAllSchools));


export default router;