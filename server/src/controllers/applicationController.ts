import {Application, NextFunction, Request, Response} from 'express';

import { ApplicationService } from "../services/applicationService";
import {ResourceNotFoundError} from "../errors/resourceNotFoundError";

export class ApplicationController {
    constructor(private applicationService: ApplicationService) {
        this.applicationService = applicationService;
    }

    async getApplications(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.signedCookies.userToken;
            const applications = await this.applicationService.getAllApplications(userId);
            return res.status(200).json(applications);
        } catch (error) {
            return next(error);
        }
    }

    async addApplication(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                txtFirstName: firstName,
                txtLastName: lastName,
                txtPesel: pesel,
                txtSchools: schools
            } = req.body;
            const userId = req.signedCookies.userToken;

            await this.applicationService.addApplication(firstName, lastName, pesel, schools, userId);
            return res.status(201).json({ message: 'Application successful', redirect: '/appllicationSubmitted' });
        } catch (error) {
            return next(error)
        }
    }
}