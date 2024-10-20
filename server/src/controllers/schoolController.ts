import { NextFunction, Request, Response } from 'express';

import { School } from '../models/schoolModel';
import defaultSchoolService, { SchoolService } from "../services/schoolService";

export class SchoolController {
    private schoolService: SchoolService;

    constructor(schoolService?: SchoolService) {
        if (schoolService != null) {
            this.schoolService = schoolService;
        } else {
            this.schoolService = defaultSchoolService
        }
    }

    async getAllSchools(_req: Request, res: Response, next: NextFunction) {
        try {
            const schools: School[] = await this.schoolService.getAllSchools();
            return res.status(200).json(schools);
        } catch (error) {
            return next(error);
        }
    }

    async addSchool(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, enrollmentLimit } = req.body;
            await this.schoolService.addSchool(name, enrollmentLimit);
            return res.status(201).json("School addition successful");
        } catch (error) {
            return next(error);
        }
    }
}

export default new SchoolController()