import {NextFunction, Request, Response, Router} from 'express';

import {applicationController} from '../dependencyContainer'
import {applicationValidator} from "../validators/applicationValidator";
import {authorize} from "../middlewares/authorize";
import {handleValidationErrors} from "../middlewares/validationErrorHandler";


const router = Router();

router.get('/applications', authorize('user', 'candidate'), async (req: Request, res: Response, next: NextFunction) => {
    return await applicationController.getApplications(req, res, next)
});

router.get('/submissions', authorize('user', 'candidate'), async (req: Request, res: Response, next: NextFunction) => {
    return await applicationController.getApplicationSubmissions(req, res, next)
});

router.put('/application', authorize('user', 'candidate'), applicationValidator, handleValidationErrors, async (req: Request, res: Response, next: NextFunction) => {
    return await applicationController.updateApplication(req, res, next)
});

router.post('/application', authorize('user', 'candidate'), applicationValidator, handleValidationErrors, async (req: Request, res: Response, next: NextFunction) => {
    return await applicationController.addApplication(req, res, next)
});

export default router;
