import {NextFunction, Request, Response} from 'express';

import {School} from "../dto/school/school";
import {SchoolService} from "../services/schoolService";
import {ProfileService} from "../services/profileService";
import {ProfileRequest} from "../dto/profile/profileRequest";
import {ProfileWithCriteria} from "../dto/profile/profileWithCriteria";
import {ApplicationService} from "../services/applicationService";
import {RankListService} from '../services/rankListService';


export class SchoolAdminController {
    constructor(
        private schoolService: SchoolService,
        private profileService: ProfileService,
        private rankListService: RankListService,
        private applicationService: ApplicationService,
    ) {
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
                return res.status(200).json();

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
            const schoolId: number = Number(req.params.id);
            const userId: number = req.signedCookies.userId;

            const newSchool: School = await this.schoolService.getSchoolByAdminAndId(schoolId, userId);

            res.clearCookie('profileId');
            res.cookie('schoolId', newSchool.id, {
                signed: true,
                secure: true,
                httpOnly: true,
                maxAge: 86400000
            });

            return res.status(200).json({
                message: 'SchoolWithProfiles switched successfully',
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
            const profile: ProfileWithCriteria | null = (profileId == null)
                ? await this.profileService.getProfileBySchool(schoolId)
                : await this.profileService.getProfileByIdAndSchoolId(profileId, schoolId);

            if (profile == null)
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


    async getProfiles(req: Request, res: Response, next: NextFunction) {
        try {
            const schoolId = req.signedCookies.schoolId
            if (schoolId == null) return res.status(200).json();
            const profiles = await this.profileService.getAllProfilesBySchool(schoolId)
            return res.status(200).json(profiles);
        } catch (error) {
            return next(error);
        }
    }

    async switchProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const profileId: number = Number(req.params.id);
            const schoolId: number = req.signedCookies.schoolId;

            const newProfile: ProfileWithCriteria = await this.profileService.getProfileByIdAndSchoolId(profileId, schoolId);

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

    async deleteProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const profileId: number = Number(req.params.id);
            const schoolId: number = req.signedCookies.schoolId;

            await this.profileService.deleteProfile(profileId, schoolId);

            res.clearCookie('profileId');

            return res.status(200).json({
                message: 'Profile deleted successfully',
            });
        } catch (error) {
            return next(error);
        }
    }

    async addProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const profile: ProfileRequest = req.body;

            const schoolId: number = req.signedCookies.schoolId;

            await this.profileService.addProfile(profile, schoolId);

            return res.status(201).json({
                message: 'Profile added successfully',
                redirect: '/'
            });
        } catch (error) {
            return next(error);
        }
    }

    async updateProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const profile: ProfileRequest = req.body;
            const schoolId: number = req.signedCookies.schoolId;
            await this.profileService.updateProfile(profile, schoolId);

            return res.status(201).json({
                message: 'Profile added successfully',
                redirect: '/'
            });
        } catch (error) {
            return next(error);
        }
    }

    async getAllApplicationsByProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const profileId = req.signedCookies.profileId!;
            const list = await this.rankListService.getRankListById(profileId);
            return res.status(200).json(list)
        } catch (error) {
            return next(error);
        }
    }

    async rejectApplication(req: Request, res: Response, next: NextFunction) {
        try {
            const profileId = req.signedCookies.profileId!;
            const applicationId = Number(req.params.id)!;
            await this.applicationService.rejectApplication(applicationId, profileId);
            return res.status(204).json()
        } catch (error) {
            return next(error);
        }
    }

}