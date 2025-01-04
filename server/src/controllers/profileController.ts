import {NextFunction, Request, Response} from 'express';
import {ProfileService} from "../services/profileService";


export class ProfileController {
    constructor(private profileService: ProfileService) {
    }

    async getPoints(req: Request, res: Response, next: NextFunction) {
        try {
            const profileId = Number(req.params.id);
            const candidateId: number = req.signedCookies.candidateId;
            const pointsInfo = await this.profileService.getPoints(profileId, candidateId);
            return res.status(201).json(pointsInfo);
        } catch (error) {
            return next(error);
        }
    }
}