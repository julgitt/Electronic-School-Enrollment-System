import {NextFunction, Request, Response, Router} from 'express';

import {schoolController} from "../dependencyContainer";
import {authorize} from "../middlewares/authorize";


const router = Router();

router.get('/schools', authorize('user', 'admin', 'schoolAdmin'), async (req: Request, res: Response, next: NextFunction) => {
    return await schoolController.getAllSchoolsWithProfiles(req, res, next);
});

router.put('/schools', authorize('admin'), async (req: Request, res: Response, next: NextFunction) => {
    return await schoolController.updateSchools(req, res, next);
});

router.get('/school', authorize('schoolAdmin'), async (req: Request, res: Response, next: NextFunction) => {
    return await schoolController.getSchool(req, res, next);
});

router.get('/schoolsByAdmin', authorize('schoolAdmin'), async (req: Request, res: Response, next: NextFunction) => {
    return await schoolController.getSchoolsByAdmin(req, res, next);
});

router.post('/switchSchool', authorize('schoolAdmin'), async (req: Request, res: Response, next: NextFunction) => {
    return await schoolController.switchSchool(req, res, next);
});

export default router;