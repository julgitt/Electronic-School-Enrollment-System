import { Router, Request, Response } from 'express';

import { authorize } from "../middlewares/authorize";
import { applicationValidator } from "../validators/applicationValidator";
import { validationResult } from "express-validator";
import {ApplicationController} from "../controllers/applicationController";

const router = Router();
const applicationCtrl = new ApplicationController();

router.get('/apply', authorize('user'), (_req: Request, res: Response) => {
    return res.status(200).send({ message: 'Authorization successful'});
});

router.post('/apply', authorize('user'),  applicationValidator, async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }
    return await applicationCtrl.addApplication(req, res);
});

export default router;
