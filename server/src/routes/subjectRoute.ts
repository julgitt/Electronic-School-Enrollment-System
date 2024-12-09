import {NextFunction, Request, Response, Router} from 'express';

import {subjectController} from "../dependencyContainer";


const router = Router();

router.get('/subjects', async (req: Request, res: Response, next: NextFunction) => {
    return await subjectController.getAllSubjects(req, res, next);
});

export default router;
