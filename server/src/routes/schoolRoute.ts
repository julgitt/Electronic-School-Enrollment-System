import {NextFunction, Request, Response, Router} from 'express';

import {schoolController} from "../dependencyContainer";
import {authorize} from "../middlewares/authorize";


const router = Router();

router.get('/schools', authorize('user'), async (req: Request, res: Response, next: NextFunction) => {
    return await schoolController.getAllSchoolsWithProfiles(req, res, next);
});

export default router;