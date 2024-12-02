import {NextFunction, Router, Request, Response} from 'express';

import { tx } from "../db";
import { userSignupValidator, userLoginValidator } from '../validators/userValidator';
import { handleValidationErrors } from '../middlewares/validationErrorHandler';

import { UserRepository } from "../repositories/userRepository";
import { UserService } from "../services/userService";
import { UserController } from '../controllers/userController';
import {CandidateRepository} from "../repositories/candidateRepository";
import {CandidateService} from "../services/candidateService";

const candidateRepository: CandidateRepository = new CandidateRepository();
const candidateService: CandidateService = new CandidateService(candidateRepository);

const userRepository: UserRepository = new UserRepository();
const userService: UserService = new UserService(userRepository, tx);
const userController = new UserController(userService, candidateService);

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
