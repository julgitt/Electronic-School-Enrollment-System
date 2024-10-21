import { Router } from 'express';

import { tx } from "../db";
import { userSignupValidator, userLoginValidator } from '../validators/userValidator';
import { handleValidationErrors } from '../middlewares/validationMiddleware';
import { asyncHandler } from '../middlewares/asyncHandler';

import { UserRepository } from "../repositories/userRepository";
import { UserService } from "../services/userService";
import { UserController } from '../controllers/userController';


const userRepository: UserRepository = new UserRepository();
const userService: UserService = new UserService(userRepository, tx);
const userController = new UserController(userService);

const router = Router();

router.post('/signup', userSignupValidator, handleValidationErrors, asyncHandler(userController.register));
router.post('/login', userLoginValidator, handleValidationErrors, asyncHandler(userController.login));
router.post('/logout', asyncHandler(userController.logout));
router.get('/user', asyncHandler(userController.getUser));

export default router;
