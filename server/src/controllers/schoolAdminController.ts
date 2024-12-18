import {NextFunction, Request, Response} from 'express';

import {AdminService} from "../services/adminService";
import {School} from "../dto/school/school";
import {SchoolService} from "../services/schoolService";
import {ProfileService} from "../services/profileService";
import {Profile} from "../dto/profile";
import {ResourceNotFoundError} from "../errors/resourceNotFoundError";


export class SchoolAdminController {
    constructor(private schoolService: SchoolService, private profileService: ProfileService) {
    }

    async getSchool(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.signedCookies.userId
            if (userId == null) return res.status(200).json();

            const schoolId = req.signedCookies.schoolId;
            const school: School | null = (schoolId == null)
                ? await this.schoolService.getSchoolByAdmin(userId)
                : await this.schoolService.getSchoolByAdminAndId(schoolId, userId);


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

            const newSchool: School = await this.schoolService.getSchoolByAdminAndId(schoolId, userId);

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

    async getProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.signedCookies.userId
            if (userId == null) return res.status(200).json();

            const profileId = req.signedCookies.profileId;
            const schoolId = req.signedCookies.schoolId;
            const profile: Profile | null = (profileId == null)
                ? await this.profileService.getProfileBySchool(schoolId)
                : await this.profileService.getProfile(profileId);

            if (profile == null || profile.schoolId != schoolId)
                return res.status(200).json({});

            res.cookie('profileId', profile.id, {
                signed: true,
                secure: true,
                httpOnly: true,
                maxAge: 86400000
            });

            return res.status(200).json(profile);
        } catch (error) {
            return next(error);
        }
    }

    async switchProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const profileId: number = req.body.profileId;
            const schoolId: number = req.signedCookies.schoolId;

            const newProfile: Profile = await this.profileService.getProfile(profileId);

            if (newProfile.schoolId != schoolId) throw new ResourceNotFoundError('Profil nie znaleziony.');

            res.cookie('profileId', newProfile.id, {
                signed: true,
                secure: true,
                httpOnly: true,
                maxAge: 86400000
            });

            return res.status(200).json({
                message: 'Profile switched successfully',
                profile: newProfile
            });
        } catch (error) {
            return next(error);
        }
    }
}