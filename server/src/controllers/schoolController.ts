import { NextFunction, Request, Response } from 'express';

import { School } from '../entities/schoolModel';
import { SchoolService } from "../services/schoolService";

export class SchoolController {
    constructor(private schoolService: SchoolService) {
        this.schoolService = schoolService;
    }

    async getAllSchoolsWithProfiles(_req: Request, res: Response, next: NextFunction) {
        try {
            const schools: School[] = await this.schoolService.getAllSchoolsWithProfiles();
            return res.status(200).json(schools);
        } catch (error) {
            return next(error);
        }
    }

    async addSchool(req: Request, res: Response, next: NextFunction) {
        try {
            const { name } = req.body;
            await this.schoolService.addSchool(name);
            return res.status(201).json("School addition successful");
        } catch (error) {
            return next(error);
        }
    }
}