import {NextFunction, Request, Response, Router} from 'express';

import {profileController} from "../dependencyContainer";
import {authorize} from "../middlewares/authorize";


const router = Router();

router.get('/profile/:id/points', authorize("user"), async (req: Request, res: Response, next: NextFunction) => {
    return await profileController.getPoints(req, res, next);
});

export default router;
