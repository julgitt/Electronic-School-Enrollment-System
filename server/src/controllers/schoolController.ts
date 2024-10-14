import { NextFunction, Request, Response } from 'express';

import schoolService from '../services/schoolService';
import { School } from '../models/schoolModel';

class SchoolController {
    async getAllSchools(_req: Request, res: Response, next: NextFunction) {
        try {
            const schools: School[] = await schoolService.getAllSchools();
            return res.status(200).json(schools);
        } catch (error) {
            return next(error);
        }
    }

    async addSchool(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, enrollmentLimit } = req.body;
            await schoolService.addSchool(name, enrollmentLimit);
            return res.status(201).json("School addition successful");
        } catch (error) {
            return next(error);
        }
    }
}

export default new SchoolController();
