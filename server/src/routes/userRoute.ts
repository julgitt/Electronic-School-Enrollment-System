import {NextFunction, Request, Response, Router} from 'express';

import {userController} from "../dependencyContainer";
import {userLoginValidator, userSignupValidator} from '../validators/userValidator';
import {handleValidationErrors} from '../middlewares/validationErrorHandler';


const router = Router();

router.post('/signup', userSignupValidator, handleValidationErrors, async (req: Request, res: Response, next: NextFunction) => {
    return await userController.register(req, res, next);
});

router.post('/login', userLoginValidator, handleValidationErrors, async (req: Request, res: Response, next: NextFunction) => {
    return await userController.login(req, res, next);
});

router.post('/logout', async (req: Request, res: Response, next: NextFunction) => {
    return await userController.logout(req, res, next);
});

router.get('/user', async (req: Request, res: Response, next: NextFunction) => {
    return await userController.getUser(req, res, next);
});

export default router;
