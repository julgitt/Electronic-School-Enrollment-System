import {NextFunction, Request, Response} from 'express';

import {AdminService} from "../services/adminService";


export class AdminController {
    constructor(private adminService: AdminService) {
    }

    async enroll(_req: Request, res: Response, next: NextFunction) {
        try {
            await this.adminService.processProfileEnrollments();
            return res.status(200).json({message: "Enrolled successfully."});
        } catch (error) {
            return next(error);
        }
    }
}