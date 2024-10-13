import { Router, Request, Response } from 'express';
import { applicationValidator } from "../validators/applicationValidator";

import { authorize } from "../middlewares/authorize";
import applicationController from "../controllers/applicationController";
import { asyncHandler } from '../middlewares/asyncHandler';

const router = Router();

router.get('/apply', authorize('user'), (_req: Request, res: Response) => {
    return res.status(200).send({ message: 'Authorization successful'});
});

router.post('/apply', authorize('user'),  applicationValidator, asyncHandler(applicationController.addApplication));

export default router;
