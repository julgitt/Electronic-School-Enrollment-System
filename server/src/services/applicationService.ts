import {ITask} from "pg-promise";

import {ApplicationRepository} from '../repositories/applicationRepository';
import {ResourceNotFoundError} from "../errors/resourceNotFoundError";
import {DataConflictError} from "../errors/dataConflictError";
import {SchoolService} from "./schoolService";
import {ProfileService} from "./profileService";
import {ApplicationWithProfiles} from "../dto/application/applicationWithProfiles";
import {ApplicationBySchool} from "../dto/application/applicationBySchool";
import {ApplicationRequest} from "../dto/application/applicationRequest";
import {ApplicationEntity} from "../models/applicationEntity";
import {Application} from "../dto/application/application";
import {EnrollmentService} from "./enrollmentService";
import {ValidationError} from "../errors/validationError";
import {Enrollment} from "../dto/enrollment";
import {ApplicationStatus} from "../dto/application/applicationStatus";
import {transactionFunction} from "../db";
import {SCHOOL_MAX} from "../../../public/adminConstants";

export class ApplicationService {
    private profileService!: ProfileService;

    constructor(
        private applicationRepository: ApplicationRepository,
        private enrollmentService: EnrollmentService,
        private schoolService: SchoolService,
        private readonly tx: transactionFunction
    ) {
    }

    setProfileService(profileService: ProfileService) {
        this.profileService = profileService;
    }

    /**
     * Pobiera wszystkie aplikacje wraz z profilami złożone przez podanego kandydata.
     * Jeżeli podano identyfikator naboru, to zwrócone aplikacje należą tylko do określonego naboru
     *
     * @param {number} candidateId - identyfikator kandydata.
     * @param {number} enrollmentId - identyfikator tury naboru.
     * @returns {Promise<School>} Zwraca tablicę obiektów aplikacji z profilami. Obiekty te zawierają:
     *
     *  id: number - identyfikator aplikacji
     *  round: number - turę naboru
     *  school: SchoolWithProfiles - obiekt szkoły do której złożono aplikację wraz ze wszystkimi profilami szkoły
     *  profile: Profile - obiekt profilu do którego złożono aplikację
     *  priority: number - priorytet
     *  status: string - status aplikacji
     *  createdAt: Date | number - data utworzenia aplikacji
     *  updatedAt: Date | number - data modyfikacji aplikacji
     */
    async getAllApplications(candidateId: number, enrollmentId?: number): Promise<ApplicationWithProfiles[]> {
        const applications = enrollmentId != null ?
            await this.applicationRepository.getAllByCandidateAndEnrollmentId(candidateId, enrollmentId) :
            await this.applicationRepository.getAllByCandidate(candidateId);

        return Promise.all(
            applications.map(async (app) => {
                const [enrollment, profile] = await Promise.all([
                    this.enrollmentService.getEnrollment(app.enrollmentId),
                    this.profileService.getProfile(app.profileId),
                ]);
                const school = await this.schoolService.getSchoolWithProfiles(profile.schoolId)

                return {
                    id: app.id,
                    school: school,
                    profile: profile,
                    priority: app.priority,
                    round: enrollment.round,
                    status: app.status,
                    createdAt: app.createdAt,
                    updatedAt: app.updatedAt
                };
            })
        )
    }

    /**
     * Pobiera wszystkie aplikacje ze statusem oczekującym dla podanego profilu
     *
     * @param {number} profileId - identyfikator profilu.
     * @returns {Promise<Application[]>} Zwraca tablicę obiektów oczekujących aplikacji. Obiekty te zawierają:
     *
     *  id: number - identyfikator aplikacji
     *  profileId: number - identyfikator profilu
     *  candidateId: number - identyfikator kandydata
     *  priority: number - priorytet
     *  status: string - status aplikacji
     */
    async getAllPendingByProfile(profileId: number): Promise<Application[]> {
        return this.applicationRepository.getAllByProfileAndStatus(profileId, ApplicationStatus.Pending);
    }

    /**
     * Pobiera wszystkie aplikacje ze statusem zaakceptowanym dla podanego profilu
     *
     * @param {number} profileId - identyfikator profilu.
     * @returns {Promise<Application[]>} Zwraca tablicę obiektów zaakceptowanych aplikacji. Obiekty te zawierają:
     *
     *  id: number - identyfikator aplikacji
     *  profileId: number - identyfikator profilu
     *  candidateId: number - identyfikator kandydata
     *  priority: number - priorytet
     *  status: string - status aplikacji
     */
    async getAllAcceptedByProfile(profileId: number): Promise<Application[]> {
        return this.applicationRepository.getAllByProfileAndStatus(profileId, ApplicationStatus.Accepted)
    }

    /**
     * Pobiera wszystkie oczekujące w obecnej turze aplikacje złożone przez podanego kandydata, pogrupowane ze względu na szkoły.
     * Zatem wszystkie profile należące do danej szkoły, do których złożył aplikację kandydat, będą w jednej grupie.
     *
     * @param {number} candidateId - identyfikator kandydata.
     * @returns {Promise<ApplicationBySchool[]>} Zwraca tablicę obiektów pogrupowanych aplikacji. Obiekty te zawierają:
     *
     *  - school: SchoolWithProfiles - szkołę wraz ze wszystkimi profilami należącymi do tej szkoły
     *  - profiles:  ApplicationRequest[]:
     *
     *     - profileId: number - identyfikator profilu
     *     - priority: number - priorytet
     */
    async getAllApplicationSubmissions(candidateId: number): Promise<ApplicationBySchool[]> {
        const enrollment: Enrollment | null = await this.enrollmentService.getCurrentEnrollment();
        if (!enrollment) throw new ValidationError('Nie pobrać aplikacji poza okresem naboru.');
        const applications: ApplicationWithProfiles[] = await this.getAllApplications(candidateId, enrollment.id);
        return this.groupApplicationsBySchool(applications);
    }

    /**
     * Aktualizuje status podanej aplikacji, na ten, podany w argumencie.
     *
     * @param {number} id - identyfikator aplikacji.
     * @param {ApplicationStatus} status - status aplikacji ("Oczekujący" | "Przyjęty" | "Odrzucony"
     * @param {ITask<any>} t - obiekt transakcji
     * @returns {Promise<void>}
     */
    async updateApplicationStatus(id: number, status: ApplicationStatus, t: ITask<any>): Promise<void> {
        return this.applicationRepository.updateStatus(id, status, t);
    }


    /**
     * Dodaje nowe aplikacje złożone przez podanego kandydata.
     *
     * @param {number} candidateId - identyfikator kandydata składającego aplikacje.
     * @param {ApplicationRequest[]} submissions - tablica  obiektów aplikacji, które zawierają:
     *
     *  - profileId: number - identyfikator profilu
     *  - priority: number - priorytet aplikacji
     * @returns {Promise<void>}
     *
     * @throws {ValidationError} Jeśli kandydat próbuje złożyć aplikację poza okresem naboru
     * @throws {DataConflictError} Jeśli kandydat już wcześniej złożył aplikację
     */
    async addApplication(submissions: ApplicationRequest[], candidateId: number): Promise<void> {
        const enrollment: Enrollment | null = await this.enrollmentService.getCurrentEnrollment();
        if (!enrollment) throw new ValidationError('Nie można złożyć aplikacji poza okresem naboru.');

        const existingApplications: Application[] = await this.applicationRepository.getAllByCandidateAndEnrollmentId(candidateId, enrollment.id);
        if (existingApplications.length > 0) throw new DataConflictError('Aplikacja już istnieje.');

        await this.validateProfiles(submissions);
        this.assignPriorities(submissions);

        await this.tx(async t => {
            for (const submission of submissions) {
                const newApplication = this.createApplicationEntity(submission, candidateId, enrollment.id);
                await this.applicationRepository.insert(newApplication, t);
            }
        });
    }

    /**
     * Aktualizuje aplikacje złożone przez podanego kandydata.
     *
     * @param {number} candidateId - identyfikator kandydata edytującego aplikacje.
     * @param {ApplicationRequest[]} submissions - tablica  obiektów aplikacji, które zawierają:
     *
     *  - profileId: number - identyfikator profilu
     *  - priority: number - priorytet aplikacji
     * @returns {Promise<void>}
     *
     * @throws {ValidationError} Jeśli kandydat próbuje edytować aplikację poza okresem naboru
     * @throws {ResourceNotFoundError} Jeśli nie znaleziono aplikacji
     */
    async updateApplication(submissions: ApplicationRequest[], candidateId: number): Promise<void> {
        const enrollment: Enrollment | null = await this.enrollmentService.getCurrentEnrollment();
        if (!enrollment) throw new ValidationError('Nie można złożyć aplikacji poza okresem naboru.');

        const applications: Application[] = await this.applicationRepository.getAllByCandidateAndEnrollmentId(candidateId, enrollment.id);
        if (applications.length === 0) throw new ResourceNotFoundError('Nie odnaleziono aplikacji.');

        await this.validateProfiles(submissions);
        this.assignPriorities(submissions);

        await this.tx(async t => {
            for (const application of applications) {
                await this.applicationRepository.delete(application.profileId, application.candidateId, t);
            }
            for (const submission of submissions) {
                const newApplication = this.createApplicationEntity(submission, candidateId, enrollment.id);
                await this.applicationRepository.insert(newApplication, t);
            }
        });
    }

    /**
     * Aktualizuje status aplikacji o podanym identyfikatorze na odrzucony. Wymaga profilu,
     * aby uwierzytelnić że aktualizacje przeprowadza administrator szkolny, który ma dostęp do zarządzania tą aplikacją
     *
     * @param {number} id - identyfikator aplikacji.
     * @param {number} profileId - identyfikator profilu.
     * @returns {Promise<void>}
     *
     * @throws {ResourceNotFoundError} Jeśli nie znaleziono aplikacji
     */
    async rejectApplication(id: number, profileId: number): Promise<void> {
        const application = await this.applicationRepository.getById(id);
        if (!application || profileId != application.profileId) throw new ResourceNotFoundError("Nie znaleziono aplikacji do usunięcia.");
        await this.applicationRepository.rejectById(id);
    }

    private createApplicationEntity(submission: ApplicationRequest, candidateId: number, enrollmentId: number): ApplicationEntity {
        return {
            id: 0,
            candidateId,
            profileId: submission.profileId,
            priority: submission.priority,
            enrollmentId,
            status: ApplicationStatus.Pending,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }

    private async validateProfiles(submissions: ApplicationRequest[]) {
        const schoolIds = new Set<number>();

        for (const submission of submissions) {
            const profile = await this.profileService.getProfile(submission.profileId);
            if (profile && profile.schoolId) {
                schoolIds.add(profile.schoolId);
            }
        }

        if (schoolIds.size > SCHOOL_MAX) throw new ValidationError("Przekroczono dopuszczalną liczbę szkół");
    }

    private assignPriorities(submissions: ApplicationRequest[]) {
        submissions = submissions.sort(
            (a, b) => a.priority - b.priority
        );

        submissions.forEach((item, index) => {
            item.priority = index + 1;
        });
    }

    private groupApplicationsBySchool(applications: ApplicationWithProfiles[]) {
        const groupedBySchool: ApplicationBySchool[] = [];
        for (const app of applications) {
            let schoolGroup = groupedBySchool.find(group =>
                group.school.id === app.school.id
            );
            if (!schoolGroup) {
                schoolGroup = {
                    school: app.school,
                    profiles: [],
                };
                groupedBySchool.push(schoolGroup);
            }

            schoolGroup.profiles.push({
                profileId: app.profile.id,
                priority: app.priority,
            });
        }
        return groupedBySchool;
    };
}