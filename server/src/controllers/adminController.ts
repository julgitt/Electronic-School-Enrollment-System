import {NextFunction, Request, Response} from 'express';

import {AdminService} from "../services/adminService";


export class AdminController {
    constructor(private adminService: AdminService) {}

    async enroll(_req: Request, res: Response, next: NextFunction) {
        try {
            const enrolled = this.adminService.enroll();
            return res.status(200).json(enrolled);
        } catch (error) {
            return next(error);
        }
    }
}