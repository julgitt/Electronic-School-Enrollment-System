import {NextFunction, Request, Response} from 'express';

import {CandidateService} from "../services/candidateService";
import {Candidate} from "../dto/candidate/candidate";
import {CandidateRequest} from "../dto/candidate/candidateRequest";


export class CandidateController {
    constructor(private candidateService: CandidateService) {
    }

    async switchCandidate(req: Request, res: Response, next: NextFunction) {
        try {
            const candidateId: number = req.body.candidateId;
            const userId: number = req.signedCookies.userId;

            const newCandidate: Candidate = await this.candidateService.getCandidate(candidateId, userId);

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

    async deleteCandidate(req: Request, res: Response, next: NextFunction) {
        try {
            const candidateId: number = req.body.candidateId;
            const userId: number = req.signedCookies.userId;

            await this.candidateService.deleteCandidate(candidateId, userId);

            res.clearCookie('candidateId');
            res.clearCookie('candidateName');

            return res.status(200).json({
                message: 'Candidate deleted successfully',
            });
        } catch (error) {
            return next(error);
        }
    }

    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const candidate: CandidateRequest = req.body;

            const userId: number = req.signedCookies.userId;

            await this.candidateService.register(userId, candidate);

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
            const userId: number = req.signedCookies.userId
            if (userId == null) return res.status(200).json();

            const candidateId: number = req.signedCookies.candidateId;
            const candidate: Candidate | null = (candidateId == null)
                ? await this.candidateService.getLastCreatedCandidateByUser(userId)
                : await this.candidateService.getCandidate(candidateId, userId);

            if (candidate == null)
                return res.status(200).json({
                    message: 'Candidate register required',
                    redirect: '/registerCandidate'
                });

            res.cookie('candidateId', candidate.id, {
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
            const candidateId: number = req.signedCookies.candidateId;
            const userId: number = req.signedCookies.userId;

            let candidates: Candidate[] = [];

            if (userId != null) {
                candidates = await this.candidateService.getAllByUser(userId);
                candidates = candidates.filter(candidate => candidate.id != candidateId);
            }

            res.status(200).json({candidates: candidates});
        } catch (error) {
            return next(error);
        }
    }
}
