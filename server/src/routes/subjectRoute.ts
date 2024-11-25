import {NextFunction, Router, Request, Response} from 'express';
import {SubjectController} from "../controllers/subjectController";
import {SubjectService} from "../services/subjectService";
import {SubjectRepository} from "../repositories/subjectRepository";

const subjectRepository: SubjectRepository = new SubjectRepository();
const subjectService: SubjectService = new SubjectService(subjectRepository);
const subjectController = new SubjectController(subjectService);

const router = Router();

router.get('/subjects', async (req: Request, res: Response, next: NextFunction) => {
    return await subjectController.getAllSubjects(req, res, next);
});

export default router;
