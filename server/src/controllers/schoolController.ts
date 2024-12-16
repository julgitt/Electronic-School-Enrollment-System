import {NextFunction, Request, Response} from 'express';

import {SchoolService} from "../services/schoolService";
import {SchoolWithProfiles} from "../dto/schoolWithProfiles";


export class SchoolController {
    constructor(private schoolService: SchoolService) {}

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
            return res.status(201).json("School add successfully");
        } catch (error) {
            return next(error);
        }
    }

    async updateSchool(req: Request, res: Response, next: NextFunction) {
        try {
            const {name} = req.body;
            await this.schoolService.updateSchool(Number(req.params.id), name);
            return res.status(200).json("School updated successfully");
        } catch (error) {
            return next(error);
        }
    }

    async deleteSchool(req: Request, res: Response, next: NextFunction) {
        try {
            await this.schoolService.deleteSchool(Number(req.params.id));
            return res.status(200).json("School deleted successfully");
        } catch (error) {
            return next(error);
        }
    }
}