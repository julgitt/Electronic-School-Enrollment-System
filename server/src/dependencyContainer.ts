import {CandidateRepository} from "./repositories/candidateRepository";
import {GradeRepository} from "./repositories/gradeRepository";
import {GradeService} from "./services/gradeService";
import {CandidateService} from "./services/candidateService";
import {CandidateController} from "./controllers/candidateController";
import {SubjectRepository} from "./repositories/subjectRepository";
import {UserRepository} from "./repositories/userRepository";
import {ApplicationRepository} from "./repositories/applicationRepository";
import {SchoolRepository} from "./repositories/schoolRepository";
import {ProfileRepository} from "./repositories/profileRepository";
import {SubjectService} from "./services/subjectService";
import {SubjectController} from "./controllers/subjectController";
import {GradeController} from "./controllers/gradeController";
import {UserService} from "./services/userService";
import {UserController} from "./controllers/userController";
import {ApplicationService} from "./services/applicationService";
import {SchoolService} from "./services/schoolService";
import {ProfileService} from "./services/profileService";
import {SchoolController} from "./controllers/schoolController";
import {ApplicationController} from "./controllers/applicationController";
import {tx} from "./db";
import {EnrollmentService} from "./services/enrollmentService";
import {EnrollmentRepository} from "./repositories/enrollmentRepository";
import {EnrollmentController} from "./controllers/enrollmentController";
import {AdminService} from "./services/adminService";
import {AdminController} from "./controllers/adminController";
import {SchoolAdminController} from "./controllers/schoolAdminController";


const subjectRepository: SubjectRepository = new SubjectRepository();
const subjectService: SubjectService = new SubjectService(subjectRepository);
export const subjectController: SubjectController = new SubjectController(subjectService);

const candidateRepository = new CandidateRepository();
const candidateService = new CandidateService(candidateRepository);
export const candidateController = new CandidateController(candidateService);

const userRepository = new UserRepository();
const userService = new UserService(userRepository, tx);
export const userController = new UserController(userService);

const enrollmentRepository = new EnrollmentRepository();
const enrollmentService = new EnrollmentService(enrollmentRepository, tx);
export const enrollmentController = new EnrollmentController(enrollmentService);

const gradeRepository = new GradeRepository();
const gradeService = new GradeService(gradeRepository, subjectService, enrollmentService, tx);
export const gradeController = new GradeController(gradeService);

const profileRepository = new ProfileRepository()
const profileService = new ProfileService(profileRepository, gradeService, candidateService, tx);

const schoolRepository = new SchoolRepository();
const schoolService = new SchoolService(schoolRepository, profileService, tx);
export const schoolController = new SchoolController(schoolService);

const applicationRepository = new ApplicationRepository();
const applicationService = new ApplicationService(applicationRepository, enrollmentService, schoolService, tx);
profileService.setApplicationService(applicationService);
applicationService.setProfileService(profileService);
export const applicationController = new ApplicationController(applicationService);

const adminService = new AdminService(profileService, applicationService, tx);
export const adminController = new AdminController(adminService);

export const schoolAdminController = new SchoolAdminController(schoolService, profileService, applicationService);
