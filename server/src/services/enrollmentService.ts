import {EnrollmentRepository} from "../repositories/enrollmentRepository";
import {ResourceNotFoundError} from "../errors/resourceNotFoundError";
import {Enrollment} from "../dto/enrollment";
import {transactionFunction} from "../db";

export class EnrollmentService {
    constructor(
        private enrollmentRepository: EnrollmentRepository,
        private readonly tx: transactionFunction
    ) {
    }

    /**
     * Pobiera dane o naborze na podstawie identyfikatora
     *
     * @param {number} id - identyfikator naboru.
     * @returns {Promise<Enrollment>} Zwraca obiekt naboru, zawierający:
     *
     *    id: number - identyfikator naboru
     *    round: number - turę
     *    startDate: Date - datę rozpoczęcia
     *    endDate: Date - datę zakończenia
     *
     * @throws {ResourceNotFoundError} Jeśli nie znaleziono naboru o podanym identyfikatorze.
     */
    async getEnrollment(id: number): Promise<Enrollment> {
        const enrollment = await this.enrollmentRepository.getById(id);
        if (!enrollment) throw new ResourceNotFoundError('Nabór nie znaleziony.');
        return enrollment;
    }

    /**
     * Pobiera dane o obecnie trwającym naborze
     *
     * @returns {Promise<Enrollment>} Zwraca obiekt naboru, zawierający:
     *
     *    id: number - identyfikator naboru
     *    round: number - turę
     *    startDate: Date - datę rozpoczęcia
     *    endDate: Date - datę zakończenia
     *
     *    lub null jeśli obecnie nie ma okresu naboru.
     */
    async getCurrentEnrollment(): Promise<Enrollment | null> {
        return this.enrollmentRepository.getCurrent();
    }


    /**
     * Pobiera wszystkie tury w danym roku
     *
     * @returns {Promise<Enrollment[]>} Zwraca tablicę naborów (tur, w danym roku)
     */
    async getCurrentYearEnrollments(): Promise<Enrollment[]> {
        return this.enrollmentRepository.getAllFromCurrentYear();
    }

    /**
     * Pobiera wszystkie tury z bazy danych
     *
     * @returns {Promise<Enrollment[]>} Zwraca obiekt naboru, zawierający:
     *
     * @returns {Promise<Enrollment[]>} Zwraca tablicę naborów
     */
    async getAllEnrollments(): Promise<Enrollment[]> {
        return this.enrollmentRepository.getAll();
    }

    /**
     *  Aktualizuje podane nabory poprzez:
     *
     *  - dodanie naborów, których id nie jest obecne w bazie danych
     *  - usunięcie naborów, których nie ma w podanych naborach, a które są obecne w bazie danych
     *  - zaktualizowanie naborów których id jest obecne w podanych naborach oraz w bazie danych.
     *
     * @param {Enrollment[]} enrollments - tablica obiektów naborów do aktualizowania.
     * @returns {Promise<void>}
     */
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