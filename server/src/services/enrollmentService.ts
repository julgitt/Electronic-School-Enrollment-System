import {EnrollmentRepository} from "../repositories/enrollmentRepository";

export class EnrollmentService {
    constructor(
        private enrollmentRepository: EnrollmentRepository,
    ) {}

    async getEnrollmentById(id: number){
        return this.enrollmentRepository.getById(id);
    }

    async getCurrentEnrollment() {
        return this.enrollmentRepository.getCurrent();
    }

    async getCurrentYearEnrollments() {
        return this.enrollmentRepository.getAllFromCurrentYear();
    }
}