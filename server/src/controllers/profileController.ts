import {NextFunction, Request, Response} from 'express';
import {ProfileService} from "../services/profileService";
import {RankListService} from '../services/rankListService';


export class ProfileController {
    constructor(private profileService: ProfileService, private rankListService: RankListService) {
    }

    async getPoints(req: Request, res: Response, next: NextFunction) {
        try {
            const profileId = Number(req.params.id);
            const candidateId: number = req.signedCookies.candidateId;
            const pointsInfo = await this.rankListService.getPoints(profileId, candidateId);
            return res.status(201).json(pointsInfo);
        } catch (error) {
            return next(error);
        }
    }

    async getProfilesWithInfo(_req: Request, res: Response, next: NextFunction) {
        try {
            const profilesWithInfo = await this.profileService.getProfilesWithInfo();
            return res.status(201).json(profilesWithInfo);
        } catch (error) {
            return next(error);
        }
    }
}