import { Request, Response, NextFunction } from 'express';
import { CandidateService } from "../services/candidateService";

export class CandidateController {
    constructor(private candidateService: CandidateService) {}

    async switchCandidate(req: Request, res: Response, next: NextFunction) {
        try {
            const candidateId = req.body.candidateId;
            const userId = req.signedCookies.userId;

            const newCandidate = await this.candidateService.getByIdAndUserId(userId, candidateId);

            res.cookie('candidateId', newCandidate.id, {
                signed: true,
                secure: true,
                httpOnly: true,
                maxAge: 86400000
            });
            res.cookie('candidateName', `${newCandidate.firstName} ${newCandidate.lastName}`, {
                signed: true,
                maxAge: 86400000
            });

            return res.status(200).json({
                message: 'Candidate switched successfully',
                candidate: {
                    id: newCandidate.id,
                    name: newCandidate.firstName + ' ' + newCandidate.lastName
                }
            });
        } catch (error) {
            return next(error);
        }
    }

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
            let candidateId = req.signedCookies.candidateId;
            const userId = req.signedCookies.userId
            if (candidateId == null && userId != null) {
                const candidate = await this.candidateService.getLastCreatedByUserId(userId);

                if (candidate == null)
                    return res.status(200).json({ message: 'Candidate register required', redirect: '/registerCandidate' });

                res.cookie('candidateId', candidate!.id, {
                    signed: true,
                    secure: true,
                    httpOnly: true,
                    maxAge: 86400000
                });
                res.cookie('candidateName', `${candidate!.firstName} ${candidate!.lastName}`, {
                    signed: true,
                    maxAge: 86400000
                });

                candidateId = candidate!.id;
            }
            const candidateName = req.signedCookies.candidateName;
            return res.status(200).json({ id: candidateId, name: candidateName });
        } catch (error) {
            return next(error);
        }
    }
}
