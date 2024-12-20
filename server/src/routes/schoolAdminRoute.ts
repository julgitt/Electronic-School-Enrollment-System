import {authorize} from "../middlewares/authorize";
import {NextFunction, Request, Response, Router} from "express";
import {schoolAdminController} from "../dependencyContainer";

const router = Router();

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

router.get('/admin/profile/:id', authorize('schoolAdmin'), async (req: Request, res: Response, next: NextFunction) => {
    return await schoolAdminController.switchProfile(req, res, next);
});

router.get('/admin/profiles', authorize('schoolAdmin'), async (req: Request, res: Response, next: NextFunction) => {
    return await schoolAdminController.getProfiles(req, res, next);
});

router.delete('/admin/profile/:id', authorize('schoolAdmin'), async (req: Request, res: Response, next: NextFunction) => {
    return await schoolAdminController.deleteProfile(req, res, next);
});

router.post('/admin/profile', authorize('schoolAdmin'), async (req: Request, res: Response, next: NextFunction) => {
    return await schoolAdminController.addProfile(req, res, next);
});

router.get('/admin/applications', authorize('schoolAdmin'), async (req: Request, res: Response, next: NextFunction) => {
    return await schoolAdminController.getAllApplicationsByProfile(req, res, next);
});

router.put('/admin/profile/:id', authorize('schoolAdmin'), async (req: Request, res: Response, next: NextFunction) => {
    return await schoolAdminController.updateProfile(req, res, next);
});

router.delete('/admin/application/:id', authorize('schoolAdmin'), async (req: Request, res: Response, next: NextFunction) => {
    return await schoolAdminController.deleteApplication(req, res, next);
});

export default router;