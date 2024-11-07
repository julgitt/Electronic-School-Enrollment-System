import { NextFunction, Request, Response } from 'express';

import { School } from '../models/schoolModel';
import { SchoolService } from "../services/schoolService";
import {ResourceNotFoundError} from "../errors/resourceNotFoundError";

export class SchoolController {
    constructor(private schoolService: SchoolService) {
        this.schoolService = schoolService;
    }

    async getAllSchools(_req: Request, res: Response, next: NextFunction) {
        try {
            throw new ResourceNotFoundError("Ups");

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