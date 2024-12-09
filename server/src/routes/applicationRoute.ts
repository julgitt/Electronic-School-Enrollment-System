import {NextFunction, Request, Response, Router} from 'express';

import {applicationController} from '../dependencyContainer'
import {applicationValidator} from "../validators/applicationValidator";
import {authorize} from "../middlewares/authorize";
import {handleValidationErrors} from "../middlewares/validationErrorHandler";


const router = Router();

router.get('/allApplications', authorize('user'), async (req: Request, res: Response, next: NextFunction) => {
    return await applicationController.getApplications(req, res, next)
});

router.get('/allSubmissions', authorize('user'), async (req: Request, res: Response, next: NextFunction) => {
    return await applicationController.getApplicationSubmissions(req, res, next)
});

router.put('/updateApplication', authorize('user'), applicationValidator, handleValidationErrors, async (req: Request, res: Response, next: NextFunction) => {
    return await applicationController.updateApplication(req, res, next)
});

router.post('/submitApplication', authorize('user'), applicationValidator, handleValidationErrors, async (req: Request, res: Response, next: NextFunction) => {
    return await applicationController.addApplication(req, res, next)
});

export default router;
