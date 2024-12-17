import {EnrollmentRepository} from "../repositories/enrollmentRepository";
import {ResourceNotFoundError} from "../errors/resourceNotFoundError";
import {Enrollment} from "../dto/enrollment";
import {ITask} from "pg-promise";

export class EnrollmentService {
    constructor(private enrollmentRepository: EnrollmentRepository,
                private readonly tx: (callback: (t: ITask<any>) => Promise<void>) => Promise<void>) {
    }

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

    async getAllEnrollments(): Promise<Enrollment[]> {
        return this.enrollmentRepository.getAll();
    }

    async updateEnrollments(enrollments: Enrollment[]): Promise<void> {
        const currentEnrollments = await this.getAllEnrollments();
        const currentEnrollmentIds = currentEnrollments.map(s => s.id);
        const newEnrollmentIds = enrollments.map(s => s.id);

        const enrollmentsToUpdate = enrollments.filter(s =>
            currentEnrollmentIds.includes(s.id)
        );
        const enrollmentsToDelete = currentEnrollments.filter(s =>
            !newEnrollmentIds.includes(s.id)
        );
        const enrollmentsToAdd = enrollments.filter(s =>
            !currentEnrollmentIds.includes(s.id)
        );

        await this.tx(async t => {
            for (const enrollment of enrollmentsToDelete) {
                await this.enrollmentRepository.delete(enrollment.id, t);
            }
            for (const enrollment of enrollmentsToUpdate) {
                await this.enrollmentRepository.update(enrollment, t);
            }
            for (const enrollment of enrollmentsToAdd) {
                await this.enrollmentRepository.insert(enrollment, t);
            }
        });
    }
}