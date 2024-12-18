import {NextFunction, Request, Response} from 'express';

import {SchoolService} from "../services/schoolService";
import {SchoolWithProfiles} from "../dto/school/schoolWithProfiles";
import {School} from "../dto/school/school";


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

    async updateSchools(req: Request, res: Response, next: NextFunction) {
        try {
            const schools: School[] = req.body;
            await this.schoolService.updateSchools(schools);
            return res.status(200).json("Schools updated successfully");
        } catch (error) {
            return next(error);
        }
    }
}