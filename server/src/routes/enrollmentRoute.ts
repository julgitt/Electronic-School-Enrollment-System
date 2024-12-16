import {NextFunction, Request, Response, Router} from "express";
import {enrollmentController} from "../dependencyContainer";

const router = Router();

router.get('/isPastDeadline', async (req: Request, res: Response, next: NextFunction) => {
    return enrollmentController.isPastDeadline(req, res, next);
});

router.get('/deadlines', async (req: Request, res: Response, next: NextFunction) => {
    return enrollmentController.getAllDeadlines(req, res, next);
});

router.get('/enrollments', async (req: Request, res: Response, next: NextFunction) => {
    return enrollmentController.getAllEnrollments(req, res, next);
});

router.put('/enrollments', async (req: Request, res: Response, next: NextFunction) => {
    return enrollmentController.updateEnrollments(req, res, next);
});

export default router;