import {NextFunction, Request, Response, Router} from 'express';

import {schoolController} from "../dependencyContainer";
import {authorize} from "../middlewares/authorize";


const router = Router();

router.get('/schools', authorize('user', 'admin'), async (req: Request, res: Response, next: NextFunction) => {
    return await schoolController.getAllSchoolsWithProfiles(req, res, next);
});

router.put('/schools', authorize('admin'), async (req: Request, res: Response, next: NextFunction) => {
    return await schoolController.updateSchools(req, res, next);
});

export default router;