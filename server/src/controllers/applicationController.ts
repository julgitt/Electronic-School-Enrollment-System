import {NextFunction, Request, Response} from 'express';

import {ApplicationService} from "../services/applicationService";
import {ApplicationRequest} from "../dto/application/applicationRequest";
import {ApplicationBySchool} from "../dto/application/applicationBySchool";
import {ApplicationWithProfiles} from "../dto/application/applicationWithProfiles";


export class ApplicationController {
    constructor(private applicationService: ApplicationService) {
    }

    async getApplications(req: Request, res: Response, next: NextFunction) {
        try {
            const candidateId: number = req.signedCookies.candidateId;
            const applications: ApplicationWithProfiles[] = await this.applicationService.getAllApplications(candidateId);
            return res.status(200).json(applications);
        } catch (error) {
            return next(error);
        }
    }

    async getApplicationSubmissions(req: Request, res: Response, next: NextFunction) {
        try {
            const candidateId: number = req.signedCookies.candidateId;
            const applications: ApplicationBySchool[] = await this.applicationService.getAllApplicationSubmissions(candidateId);
            return res.status(200).json(applications);
        } catch (error) {
            return next(error);
        }
    }

    async addApplication(req: Request, res: Response, next: NextFunction) {
        try {
            const applications: ApplicationRequest[] = req.body;
            const candidateId: number = req.signedCookies.candidateId;

            await this.applicationService.addApplication(applications, candidateId);
            return res.status(201).json({
                message: 'Application successful',
                redirect: '/applicationSubmitted'
            });
        } catch (error) {
            return next(error)
        }
    }

    async updateApplication(req: Request, res: Response, next: NextFunction) {
        try {
            const applications: ApplicationRequest[] = req.body;
            const candidateId = req.signedCookies.candidateId;

            await this.applicationService.updateApplication(applications, candidateId);
            return res.status(201).json({
                message: 'Application successfully updated',
                redirect: '/applicationSubmitted'
            });
        } catch (error) {
            return next(error)
        }
    }
}