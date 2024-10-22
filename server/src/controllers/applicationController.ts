import { NextFunction, Request, Response } from 'express';

import { ApplicationService } from "../services/applicationService";

export class ApplicationController {
    constructor(private applicationService: ApplicationService) {
        this.applicationService = applicationService;
    }

    async addApplication(req: Request, res: Response, next: NextFunction) {
        const { txtFirstName: firstName, txtLastName: lastName, txtPesel: pesel, txtSchools: schools } = req.body;
        const userId = req.signedCookies.userToken;

        try {
            await this.applicationService.addApplication(firstName, lastName, pesel, schools, userId);
            return res.status(201).json({ message: 'Application successful', redirect: '/applySubmitted' });
        } catch (error) {
            return next(error)
        }
    }
}