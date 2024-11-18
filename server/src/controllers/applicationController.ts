import {NextFunction, Request, Response} from 'express';

import { ApplicationService } from "../services/applicationService";

export class ApplicationController {
    constructor(private applicationService: ApplicationService) {
        this.applicationService = applicationService;
    }

    async getApplications(req: Request, res: Response, next: NextFunction) {
        try {
            const candidateId = req.signedCookies.candidateId;
            const applications = await this.applicationService.getAllApplications(candidateId);
            return res.status(200).json(applications);
        } catch (error) {
            return next(error);
        }
    }

    async addApplication(req: Request, res: Response, next: NextFunction) {
        try {
            const { selections } = req.body;
            const candidateId = req.signedCookies.candidateId;

            await this.applicationService.addApplication(selections, candidateId);
            return res.status(201).json({ message: 'Application successful', redirect: '/applicationSubmitted' });
        } catch (error) {
            return next(error)
        }
    }

    async updateApplication(req: Request, res: Response, next: NextFunction) {
        try {
            const { selections } = req.body;
            const candidateId = req.signedCookies.candidateId;

            await this.applicationService.updateApplication(selections, candidateId);
            return res.status(200).json({ message: 'Application successfully updated', redirect: '/applicationSubmitted' });
        } catch (error) {
            return next(error)
        }
    }
}