import { Router } from 'express';
import userController from '../controllers/userController';
import { userSignupValidator, userLoginValidator } from '../validators/userValidator';
import { handleValidationErrors } from '../middlewares/validationMiddleware';
import { asyncHandler } from '../middlewares/asyncHandler';

const router = Router();

router.post('/signup', userSignupValidator, handleValidationErrors, asyncHandler(userController.register));
router.post('/login', userLoginValidator, handleValidationErrors, asyncHandler(userController.login));
router.post('/logout', asyncHandler(userController.logout));
router.get('/user', asyncHandler(userController.getUser));

export default router;
