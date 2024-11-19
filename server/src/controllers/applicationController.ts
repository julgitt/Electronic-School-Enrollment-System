import {NextFunction, Request, Response} from 'express';

import { ApplicationService } from "../services/applicationService";
import {ApplicationSubmission} from "../types/applicationSubmission";

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

    async getApplicationSubmissions(req: Request, res: Response, next: NextFunction) {
        try {
            const candidateId = req.signedCookies.candidateId;
            const submissions = await this.applicationService.getAllApplicationSubmissions(candidateId);
            return res.status(200).json(submissions);
        } catch (error) {
            return next(error);
        }
    }

    async addApplication(req: Request, res: Response, next: NextFunction) {
        try {
            const { selections: applicationSubmissions}: {selections: ApplicationSubmission[]} = req.body;
            const candidateId = req.signedCookies.candidateId;

            await this.applicationService.addApplication(applicationSubmissions, candidateId);
            return res.status(201).json({ message: 'Application successful', redirect: '/applicationSubmitted' });
        } catch (error) {
            return next(error)
        }
    }

    async updateApplication(req: Request, res: Response, next: NextFunction) {
        try {
            const { selections: applicationSubmissions}: {selections: ApplicationSubmission[]} = req.body;
            const candidateId = req.signedCookies.candidateId;

            await this.applicationService.updateApplication(applicationSubmissions, candidateId);
            return res.status(200).json({ message: 'Application successfully updated', redirect: '/applicationSubmitted' });
        } catch (error) {
            return next(error)
        }
    }
}