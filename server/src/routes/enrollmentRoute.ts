import {NextFunction, Request, Response, Router} from "express";


const router = Router();

router.get('/deadline', async (_req: Request, res: Response, _next: NextFunction) => {
    return res.status(200).json(new Date('2025-12-24'));
});

export default router;