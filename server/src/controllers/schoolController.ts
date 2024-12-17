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

    async getSchool(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.signedCookies.userId
            if (userId == null) return res.status(200).json();

            const schoolId = req.signedCookies.schoolId;
            const school: School | null = (schoolId == null)
                ? await this.schoolService.getSchoolByAdmin(userId)
                : await this.schoolService.getSchool(schoolId, userId);


            if (school == null)
                return res.status(200).json({message: 'No school assign to that school admin'});

            res.cookie('schoolId', school.id, {
                signed: true,
                secure: true,
                httpOnly: true,
                maxAge: 86400000
            });

            return res.status(200).json(school);
        } catch (error) {
            return next(error);
        }
    }

    async getSchoolsByAdmin(req: Request, res: Response, next: NextFunction) {
        try {
            const userId: number = req.signedCookies.userId
            if (userId == null) return res.status(200).json();

            const schools = await this.schoolService.getSchoolsByAdmin(userId);
            return res.status(200).json(schools);
        } catch (error) {
            return next(error);
        }
    }

    async switchSchool(req: Request, res: Response, next: NextFunction) {
        try {
            const schoolId: number = req.body.schoolId;
            const userId: number = req.signedCookies.userId;

            const newSchool: School = await this.schoolService.getSchool(schoolId, userId);

            res.cookie('schoolId', newSchool.id, {
                signed: true,
                secure: true,
                httpOnly: true,
                maxAge: 86400000
            });

            return res.status(200).json({
                message: 'School switched successfully',
                school: newSchool
            });
        } catch (error) {
            return next(error);
        }
    }

}