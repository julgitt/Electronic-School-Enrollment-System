import {NextFunction, Request, Response} from 'express';

import {SchoolService} from "../services/schoolService";
import {SchoolWithProfiles} from "../dto/schoolWithProfiles";


export class SchoolController {
    constructor(private schoolService: SchoolService) {
    }

    async getAllSchoolsWithProfiles(_req: Request, res: Response, next: NextFunction) {
        try {
            const schools: SchoolWithProfiles[] = await this.schoolService.getAllSchoolsWithProfiles();
            return res.status(200).json(schools);
        } catch (error) {
            return next(error);
        }
    }

    async addSchool(req: Request, res: Response, next: NextFunction) {
        try {
            const {name} = req.body;
            await this.schoolService.addSchool(name);
            return res.status(201).json("School addition successful");
        } catch (error) {
            return next(error);
        }
    }
}