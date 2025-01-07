import {NextFunction, Request, Response, Router} from 'express';

import {adminController, enrollmentController, schoolController} from '../dependencyContainer'
import {authorize} from "../middlewares/authorize";
import {enrollmentValidator} from "../validators/enrollmentValidator";
import {handleValidationErrors} from "../middlewares/validationErrorHandler";


const router = Router();

router.put('/enroll', authorize('admin'), async (req: Request, res: Response, next: NextFunction) => {
    return await adminController.enroll(req, res, next)
});

router.get('/enrollments', authorize('admin'), async (req: Request, res: Response, next: NextFunction) => {
    return enrollmentController.getAllEnrollments(req, res, next);
});

router.put('/enrollments', authorize('admin'), enrollmentValidator, handleValidationErrors, async (req: Request, res: Response, next: NextFunction) => {
    return enrollmentController.updateEnrollments(req, res, next);
});

router.put('/schools', authorize('admin'), async (req: Request, res: Response, next: NextFunction) => {
    return await schoolController.updateSchools(req, res, next);
});

export default router;
