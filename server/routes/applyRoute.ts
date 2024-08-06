import { Router, Request, Response } from 'express';

import { authorize } from "../middlewares/authorize";

const router = Router();

router.get('/api/apply', authorize('logged'), (_req: Request, res: Response) => {
    return res.status(200).send({ message: 'Authorization successful'});
});

export default router;
