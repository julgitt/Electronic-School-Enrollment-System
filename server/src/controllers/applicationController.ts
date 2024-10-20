import { NextFunction, Request, Response } from 'express';
import defaultApplicationService, { ApplicationService } from "../services/applicationService";


export class ApplicationController {
    private applicationService: ApplicationService;

    constructor(applicationService?: ApplicationService) {
        if (applicationService != null) {
            this.applicationService = applicationService;
        } else {
            this.applicationService = defaultApplicationService;
        }
    }

    async addApplication(req: Request, res: Response, next: NextFunction) {
        const { txtFirstName: firstName, txtLastName: lastName, txtPesel: pesel, txtSchools: schools } = req.body;
        const userId = req.signedCookies.user;

        try {
            await this.applicationService.addApplication(firstName, lastName, pesel, schools, userId);
            return res.status(201).json({ message: 'Application successful', redirect: '/applySubmitted' });
        } catch (error) {
            return next(error)
        }
    }
}

export default new ApplicationController()