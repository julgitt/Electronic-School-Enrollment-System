import { Router, Request, Response } from 'express';

import { authorize } from "../middlewares/authorize";
import { SchoolController } from "../controllers/schoolController";

const router = Router();
const schoolCtrl = new SchoolController();

router.get('/schools', authorize('user'), async (req: Request, res: Response) => {
    return await schoolCtrl.getAllSchools(req, res);
});

export default router;