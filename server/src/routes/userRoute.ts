import { Router, Request, Response, NextFunction } from 'express';
import { UserController } from '../controllers/userController';
import { userSignupValidator, userLoginValidator } from '../validators/userValidator';
import {UserService} from "../services/userService";
import {UserRepository} from "../repositories/userRepository";

const router = Router();

// TODO: Global?
const userRepo = new UserRepository();
const userService = new UserService(userRepo);
const userCtrl = new UserController(userService);

const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
};

router.post('/signup', userSignupValidator, asyncHandler((req: Request, res: Response, next: NextFunction) => {
    return userCtrl.register(req, res, next);
}));

router.post('/login', userLoginValidator, asyncHandler((req: Request, res: Response, next: NextFunction) => {
    return userCtrl.login(req, res, next);
}));

router.get('/logout', asyncHandler((req: Request, res: Response, next: NextFunction) => {
    return userCtrl.logout(req, res, next);
}));

router.get('/user', asyncHandler((req: Request, res: Response, next: NextFunction) => {
    return userCtrl.getUser(req, res, next);
}));

export default router;
