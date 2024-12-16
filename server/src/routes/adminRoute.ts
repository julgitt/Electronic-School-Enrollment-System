import {NextFunction, Request, Response, Router} from 'express';

import {adminController} from '../dependencyContainer'
import {authorize} from "../middlewares/authorize";


const router = Router();

router.put('/enroll', authorize('admin'), async (req: Request, res: Response, next: NextFunction) => {
    return await adminController.enroll(req, res, next)
});

export default router;
