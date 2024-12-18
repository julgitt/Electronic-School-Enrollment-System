import {authorize} from "../middlewares/authorize";
import {NextFunction, Request, Response} from "express";
import {schoolAdminController} from "../dependencyContainer";
import router from "./schoolRoute";

router.get('/admin/school', authorize('schoolAdmin'), async (req: Request, res: Response, next: NextFunction) => {
    return await schoolAdminController.getSchool(req, res, next);
});

router.get('/admin/schools', authorize('schoolAdmin'), async (req: Request, res: Response, next: NextFunction) => {
    return await schoolAdminController.getSchoolsByAdmin(req, res, next);
});

router.get('/admin/school/:id', authorize('schoolAdmin'), async (req: Request, res: Response, next: NextFunction) => {
    return await schoolAdminController.switchSchool(req, res, next);
});

router.get('/admin/profile', authorize('schoolAdmin'), async (req: Request, res: Response, next: NextFunction) => {
    return await schoolAdminController.getProfile(req, res, next);
});

router.get('/admin/profile:id', authorize('schoolAdmin'), async (req: Request, res: Response, next: NextFunction) => {
    return await schoolAdminController.switchProfile(req, res, next);
});