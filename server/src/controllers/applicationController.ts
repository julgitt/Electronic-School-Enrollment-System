import { Request, Response } from 'express';
import { validationResult } from "express-validator";

import { ApplicationService } from '../services/applicationService';

export class ApplicationController {
    private applicationService: ApplicationService;

    constructor(applicationService: ApplicationService) {
        this.applicationService = applicationService;
    }

    private respondWithError(res: Response, message: string, errors: any, status: number){
        console.error(message, errors);

        const errorMessage = Array.isArray(errors) && errors.length > 0
            ? errors.map((err: any) => err.msg).join(', ')
            : (errors instanceof Error ? errors.message : message + "An unknown error occurred.");

        return res.status(status).json({
            errorMessage,
            errors
        });
    }

    async addApplication(req: Request, res: Response) {
        console.log("Controller");
        console.log("req: " + req);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return this.respondWithError(res, "Validation Error: ", errors.array(), 400)
        }
        console.log("Pass validation");

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
