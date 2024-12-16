import {NextFunction, Request, Response, Router} from 'express';

import {schoolController} from "../dependencyContainer";
import {authorize} from "../middlewares/authorize";


const router = Router();

router.get('/schools', authorize('user', 'admin'), async (req: Request, res: Response, next: NextFunction) => {
    return await schoolController.getAllSchoolsWithProfiles(req, res, next);
});

router.post('/school', authorize('admin'), async (req: Request, res: Response, next: NextFunction) => {
    return await schoolController.addSchool(req, res, next);
});

router.delete('/school/:id', authorize('admin'), async (req: Request, res: Response, next: NextFunction) => {
    return await schoolController.deleteSchool(req, res, next);
});

router.put('/school/:id', authorize('admin'), async (req: Request, res: Response, next: NextFunction) => {
    return await schoolController.updateSchool(req, res, next);
});

export default router;