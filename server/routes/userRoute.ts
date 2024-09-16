import { Router, Request, Response, NextFunction } from 'express';
import { UserController } from '../controllers/userController';
import { userSignupValidator, userLoginValidator } from '../validators/userValidator';

const router = Router();
const userCtrl = new UserController();

const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
};

router.post('/signup', userSignupValidator, asyncHandler((req: Request, res: Response, next: NextFunction) => {
    return userCtrl.registerUser(req, res, next);
}));

router.post('/login', userLoginValidator, asyncHandler((req: Request, res: Response, next: NextFunction) => {
    return userCtrl.loginUser(req, res, next);
}));

router.get('/logout', asyncHandler((req: Request, res: Response, next: NextFunction) => {
    return userCtrl.logout(req, res, next);
}));

router.get('/user', asyncHandler((req: Request, res: Response, next: NextFunction) => {
    return userCtrl.getUser(req, res, next);
}));

export default router;
