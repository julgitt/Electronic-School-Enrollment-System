import {EnrollmentRepository} from "../repositories/enrollmentRepository";
import {ResourceNotFoundError} from "../errors/resourceNotFoundError";
import {Enrollment} from "../dto/enrollment";

export class EnrollmentService {
    constructor (private enrollmentRepository: EnrollmentRepository) {}

    async getEnrollment(id: number): Promise<Enrollment> {
        const enrollment = await this.enrollmentRepository.getById(id);
        if (!enrollment) throw new ResourceNotFoundError('Nabór nie znaleziony.');
        return enrollment;
    }

    async getCurrentEnrollment(): Promise<Enrollment | null> {
        return this.enrollmentRepository.getCurrent();
    }

    async getCurrentYearEnrollments(): Promise<Enrollment[]> {
        return this.enrollmentRepository.getAllFromCurrentYear();
    }
}