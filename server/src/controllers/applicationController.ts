import { NextFunction, Request, Response } from 'express';

import applicationService from '../services/applicationService';

class ApplicationController {
    async addApplication(req: Request, res: Response, next: NextFunction) {
        const { txtFirstName: firstName, txtLastName: lastName, txtPesel: pesel, txtSchools: schools } = req.body;
        const userId = req.signedCookies.user;

        try {
            await applicationService.addApplication(firstName, lastName, pesel, schools, userId);
            return res.status(201).json({ message: 'Application successful', redirect: '/applySubmitted' });
        } catch (error) {
            return next(error)
        }
    }
}

export default new ApplicationController();