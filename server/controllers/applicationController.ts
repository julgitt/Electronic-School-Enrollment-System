import { Request, Response } from 'express';
import { validationResult } from "express-validator";

import { ApplicationService } from '../services/applicationService';

export class ApplicationController {
    private applicationService: ApplicationService;

    constructor() {
        this.applicationService = new ApplicationService();
    }

    private respondWithError(res: Response, message: string, error: any, status: number){
        console.error(message, error);
        return res.status(status).json({
            message: error instanceof Error ? error.message : message + "An unknown error occurred.",
            ...(error.errors ? { errors: error.errors } : {})
        });
    }

    async addApplication(req: Request, res: Response) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return this.respondWithError(res, "Validation Error: ", { errors: errors.array() }, 400)
        }

        const { txtFirstName: firstName, txtLastName: lastName, txtPesel: pesel, txtSchools: schools } = req.body;
        const userId = req.signedCookies.user;

        try {
            await this.applicationService.addApplication(firstName, lastName, pesel, schools, userId);
            return res.status(201).json({ message: 'Application successful', redirect: '/applySubmitted' });
        } catch (error) {
            return this.respondWithError(res, "Application Error: ", error, 400)
        }
    }
}
