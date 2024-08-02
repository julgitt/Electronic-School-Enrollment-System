import { Router, Request, Response } from 'express';
import { validationResult } from 'express-validator';

import { UserController } from '../controllers/userController';
import { isUserInRole } from '../middlewares/authorize';
import { userSignupValidator, userLoginValidator } from '../validators/userValidator';

const router = Router();
const userCtrl = new UserController();

// Logout: delete user cookie and respond
router.get('/logout', (_req: Request, res: Response) => {
    res.cookie('user', '', { maxAge: -1 });
    return res.status(200).json({ message: 'Logout successful' });
});

// Login: authenticate user
router.post('/login', userLoginValidator, async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const username = req.body.txtUser;
    const pwd = req.body.txtPwd;

    try {
        const isValidUser = await userCtrl.getUser(username, username, pwd);
        if (isValidUser) {
            res.cookie('user', username, {signed: true});
            let returnUrl = req.query.returnUrl as string;

            if (await isUserInRole(username, 'admin')) {
                returnUrl = '/admin_dashboard';
            }

            return res.status(201).json({redirect: returnUrl || '/'});
        } else {
            return res.status(401).json({message: "Incorrect username/password combination."});
        }
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Internal server error', error });
    }
});

// Signup: register new user
router.post('/signup', userSignupValidator, async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { txtUser: username, txtEmail: email, txtPwd: pwd } = req.body;

    try {
        const userExists = await userCtrl.isLoginTaken(username);
        const emailExists = await userCtrl.isEmailTaken(email);

        if (userExists) {
            return res.status(400).json({ message: "That username is already taken" });
        }

        if (emailExists) {
            return res.status(400).json({ message: "That email is already taken" });
        }
        await userCtrl.doInsertUser(username, email, pwd);
        return res.status(201).json({ message: 'Signup successful', user: { username }, redirect: '/login' });
    } catch (error) {
        console.error('Signup error:', error);
        return res.status(500).json({ message: 'Internal server error', error });
    }
});

export default router;