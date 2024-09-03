import { Router, Request, Response } from 'express';
import { applicationValidator } from "../validators/applicationValidator";

import { authorize } from "../middlewares/authorize";
import { ApplicationController } from "../controllers/applicationController";

const router = Router();
const applicationCtrl = new ApplicationController();

router.get('/apply', authorize('user'), (_req: Request, res: Response) => {
    return res.status(200).send({ message: 'Authorization successful'});
});

router.post('/apply', authorize('user'),  applicationValidator, async (req: Request, res: Response) => {
    return await applicationCtrl.addApplication(req, res);
});

export default router;
