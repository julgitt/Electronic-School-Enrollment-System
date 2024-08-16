import { Request, Response } from 'express';
import { ApplicationService } from '../services/applicationService';
import { UserService } from '../services/userService';

export class ApplicationController {
    private applicationService: ApplicationService;
    private userService: UserService;

    constructor() {
        this.applicationService = new ApplicationService();
        this.userService = new UserService();
    }

    private respondWithError(res: Response, message: string, error: any, status: number){
        console.error(message, error);
        return res.status(status).json({
            message: error instanceof Error ? error.message : message + "An unknown error occurred."
        });
    }

    async addApplication(req: Request, res: Response) {
        const { txtFirstName: firstName, txtLastName: lastName, txtPesel: pesel, txtSchools: schools } = req.body;
        const userId = req.signedCookies.user;
        try {
            const Application = await this.applicationService.addApplication(firstName, lastName, pesel, schools, userId);
            return res.status(201).json({ message: 'Application successful', redirect: '/apply_successful' });
        } catch (error) {
            return this.respondWithError(res, "Application Error: ", error, 400)
        }
    }
}
