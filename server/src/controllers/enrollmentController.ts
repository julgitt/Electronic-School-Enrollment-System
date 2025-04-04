import {NextFunction, Request, Response} from 'express';

import {EnrollmentService} from "../services/enrollmentService";
import {Enrollment} from "../dto/enrollment";


export class EnrollmentController {
    constructor(private enrollmentService: EnrollmentService) {
    }

    async isPastDeadline(_req: Request, res: Response, next: NextFunction) {
        try {
            const enrollment: Enrollment | null = await this.enrollmentService.getCurrentEnrollment();

            return res.status(200).json({
                isPastDeadline: enrollment == null,
            });
        } catch (error) {
            return next(error);
        }
    }

    async getAllCurrentYearEnrollments(_req: Request, res: Response, next: NextFunction) {
        try {
            const deadlines: Enrollment[] = await this.enrollmentService.getCurrentYearEnrollments();

            return res.status(200).json(deadlines);
        } catch (error) {
            return next(error);
        }
    }

    async getAllEnrollments(_req: Request, res: Response, next: NextFunction) {
        try {
            const deadlines: Enrollment[] = await this.enrollmentService.getAllEnrollments();
            return res.status(200).json(deadlines);
        } catch (error) {
            return next(error);
        }
    }

    async updateEnrollments(req: Request, res: Response, next: NextFunction) {
        try {
            const deadlines: Enrollment[] = req.body;
            await this.enrollmentService.updateEnrollments(deadlines);
            return res.status(200).json("Enrollments updated successfully");
        } catch (error) {
            return next(error);
        }
    }
}
