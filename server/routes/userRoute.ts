import { Router, Request, Response } from 'express';
import { UserController } from '../controllers/userController';
import { userSignupValidator, userLoginValidator } from '../validators/userValidator';
import { validationResult } from 'express-validator';

const router = Router();
const userCtrl = new UserController();

router.post('/signup', userSignupValidator, async (req: Request, res: Response) => {
    return await userCtrl.registerUser(req, res);
});

router.post('/login', userLoginValidator, async (req: Request, res: Response) => {
    return await userCtrl.loginUser(req, res);
});

router.get('/logout', async (req: Request, res: Response) => {
    return await userCtrl.logout(req, res);
});

router.get('/user', async (req: Request, res: Response) => {
    return await userCtrl.getUser(req, res);
});

export default router;
