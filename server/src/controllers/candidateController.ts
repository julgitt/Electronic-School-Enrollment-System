import { Request, Response, NextFunction } from 'express';
import { CandidateService } from "../services/candidateService";
import {Candidate} from "../models/candidateModel";

export class CandidateController {
    constructor(private candidateService: CandidateService) {
    }

    async switchCandidate(req: Request, res: Response, next: NextFunction) {
        try {
            const candidateId = req.body.candidateId;
            const userId = req.signedCookies.userId;

            const newCandidate = await this.candidateService.getByIdAndUserId(candidateId, userId);

            res.cookie('candidateId', newCandidate.id, {
                signed: true,
                secure: true,
                httpOnly: true,
                maxAge: 86400000
            });

            return res.status(200).json({
                message: 'Candidate switched successfully',
                candidate: newCandidate
            });
        } catch (error) {
            return next(error);
        }
    }

    /*
        async edit(req: Request, res: Response, next: NextFunction) {
            try {
                const {
                    firstName,
                    lastName,
                    pesel
                } = req.body;

                const userId = req.signedCookies.userId;
            }
        }
    */

    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                firstName,
                lastName,
                pesel
            } = req.body;

            const userId = req.signedCookies.userId;

            await this.candidateService.register(userId, firstName, lastName, pesel);

            return res.status(201).json({
                message: 'Registering candidate successful',
                redirect: '/'
            });
        } catch (error) {
            return next(error);
        }
    }

    async getCandidate(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.signedCookies.userId
            if (userId == null) return res.status(200).json();

            let candidateId = req.signedCookies.candidateId;
            const candidate = (candidateId == null)
                ? await this.candidateService.getLastCreatedByUserId(userId)
                : await this.candidateService.getByIdAndUserId(candidateId, userId);

            if (candidate == null)
                return res.status(200).json({
                    message: 'Candidate register required',
                    redirect: '/registerCandidate'
                });

            res.cookie('candidateId', candidate!.id, {
                signed: true,
                secure: true,
                httpOnly: true,
                maxAge: 86400000
            });

            return res.status(200).json({candidate: candidate});
        } catch (error) {
            return next(error);
        }
    }

    async getAllCandidates(req: Request, res: Response, next: NextFunction) {
        try {
            let candidateId = req.signedCookies.candidateId;
            const userId = req.signedCookies.userId;

            let candidates: Candidate[] = [];

            if (userId != null) {
                candidates = await this.candidateService.getAllByUserId(userId);
                candidates = candidates.filter(item => item.id != candidateId);
            }

            res.status(200).json({candidates: candidates});
        } catch (error) {
            return next(error);
        }
    }
}
