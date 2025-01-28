import {ProfileCriteriaEntity, ProfileCriteriaType} from "../models/profileCriteriaEntity";
import {ProfileCriteria} from "../dto/criteriaByProfile";
import {Grade} from "../dto/grade/grade";
import {GradeService} from "./gradeService";
import {Application} from "../dto/application/application";
import {CandidateService} from "./candidateService";
import {appendFile} from 'fs';
import {EnrollmentLists, RankList} from "../dto/application/rankedApplication";
import {GRADE_TO_POINTS} from "../../../public/adminConstants";
import {GradeType} from "../dto/grade/gradeType";
import {GradesInfo, PointsInfo} from "../dto/grade/pointsInfo";
import {SubjectService} from "./subjectService";
import {ProfileWithInfo} from "../dto/profile/profileInfo";
import {ProfileService} from "./profileService";
import {CandidateWithGrades} from "../dto/candidate/candidateWithGrades";
import {ApplicationWithInfo} from "../dto/application/applicationWithInfo";

export class RankListService {

    constructor(
        private gradeService: GradeService,
        private subjectService: SubjectService,
        private candidateService: CandidateService,
        private profileService: ProfileService
    ) {
    }

    /**
     *  Pobiera informację o punktach, które zdobył podany kandydat do profilu.
     *
     * @param {number} id - identyfikator profilu.
     * @param {number} candidateId - identyfikator kandydata kandydującego do tego profilu.
     * @returns {Promise<PointsInfo>} Zwraca obiekt informacji o punktach, który zawiera:
     *
     * - points: (number) - ilość zdobytych punktów do profilu, obliczona w oparci o oceny kandydata oraz kryteria profilu.
     * - gradesInfo: (GradesInfo) - obiekt zawierający informacje o ocenach ze świadectwa kandydata:
     *
     *      - grade- wartość oceny
     *      - subject- przedmiot, z którego jest ocena
     *      - type- typ kryterium rekrutacyjnego jakie spełnia przedmiot dla danego profilu (czy jest to kryterium obowiązkowe, czy alternatywne)
     *
     * @throws {ResourceNotFoundError} Jeśli nie znaleziono kryteriów dla podanego profilu.
     */
    async getPoints(id: number, candidateId: number): Promise<PointsInfo> {
        const [criteria, grades] = await Promise.all([
            this.profileService.getProfileCriteria(id),
            this.gradeService.getAllByCandidate(candidateId)
        ]);

        const gradesInfo = await this.getGradesInfo(grades, criteria);

        return {points: this.calculatePoints(criteria, grades), gradesInfo};
    }

    /**
     *  Pobiera listę rekrutacyjną dla podanego profilu.
     *  Listy rekrutacyjne są sortowane według punktów uzyskanych przez kandydatów.
     *
     * @param {number} id - identyfikator profilu.
     * @returns {Promise<RankList>} Zwraca listę rekrutacyjną, na którą składa się:
     *
     *  - prevAccepted: lista kandydatów przyjętych w poprzednich turach
     *  - accepted: lista kandydatów kwalifikujących się w obecnej turze
     *  - reserve: lista kandydatów niekwalifikujących się, którzy są na liście rezerwowej
     *
     * @throws {ResourceNotFoundError} Jeśli nie znaleziono kryteriów dla profilu.
     */
    async getRankListById(id: number): Promise<RankList> {
        const [candidatesWithGrades, profile] = await Promise.all([
            this.candidateService.getAllWithGrades(),
            this.profileService.getProfileWithInfo(id)
        ]);
        return this.createRankList(profile, candidatesWithGrades);
    }

    /**
     *  Pobiera wszystkie listy rekrutacyjne dla każdego profilu wraz z dodatkowymi informacjami.
     *
     * @returns {Promise<EnrollmentLists>} Zwraca obiekt, zawierający:
     *
     * accepted - listę zaakceptowanych aplikacji
     * rejected - zainicjalizowana lista odrzuconych aplikacji
     * reserveByProfile - mapę, dla której:
     *      klucz - identyfikator profilu
     *      wartość - lista rezerwowa kandydatów
     *
     * @throws {ResourceNotFoundError} Jeśli nie znaleziono kryteriów dla profilu.
     */
    async getEnrollmentLists(): Promise<EnrollmentLists> {
        const [candidatesWithGrades, profiles] = await Promise.all([
            this.candidateService.getAllWithGrades(),
            this.profileService.getProfilesWithInfo()
        ]);

        appendFile(
            'executionTime.txt',
            `${performance.now()} start\n`,
            (err) => {
                if (err) console.log("Error:" + err);
            }
        );
        const reserveByProfile = new Map<number, ApplicationWithInfo[]>();
        const allAccepted: ApplicationWithInfo[] = []

        profiles.forEach(profile => {
            const {accepted, reserve} = this.createRankList(profile, candidatesWithGrades)
            reserveByProfile.set(profile.id, reserve)
            allAccepted.push(...accepted)
        });

        return {
            reserveByProfile,
            accepted: allAccepted,
            rejected: [],
            acceptedByCandidate: new Map<number, ApplicationWithInfo>
        };
    }

    private async getGradesInfo(grades: Grade[], criteria: ProfileCriteria[]): Promise<GradesInfo[]> {
        const gradesInfoPromises = grades.map(async grade => {
            const criterion = criteria.find(c => c.subjectId === grade.subjectId && grade.type === GradeType.Certificate)
            if (!criterion) return null

            const subject = await this.subjectService.getSubject(grade.subjectId)
            return {grade: grade.grade, subject: subject.name, type: criterion.type}
        })
        return (await Promise.all(gradesInfoPromises)).filter(grade => grade !== null)
    }

    private createRankList(profile: ProfileWithInfo, candidatesWithGrades: CandidateWithGrades[]) {
        const rankedAccepted = this.rankApplications(profile.accepted, profile, candidatesWithGrades)
        const rankedPending = this.rankApplications(profile.pending, profile, candidatesWithGrades)
        const capacity = profile.capacity - rankedAccepted.length;

        return {
            prevAccepted: rankedAccepted,
            accepted: rankedPending.slice(0, capacity),
            reserve: rankedPending.slice(capacity)
        };
    }

    private rankApplications(applications: Application[], profile: ProfileWithInfo, candidatesWithGrades: CandidateWithGrades[]) {
        return applications
            .map(a => this.rankApplication(profile, a, candidatesWithGrades.find(c => c.candidate.id === a.candidateId)!))
            .sort((a, b) => b.points - a.points);
    }

    private rankApplication(profile: ProfileWithInfo, application: Application, candidateWithGrades: CandidateWithGrades): ApplicationWithInfo {
        const points = this.calculatePoints(profile.criteria, candidateWithGrades.grades);
        return {
            id: application.id,
            candidate: candidateWithGrades.candidate,
            points,
            priority: application.priority,
            status: application.status,
            profile
        }
    }

    private calculatePoints(profileCriteria: ProfileCriteriaEntity[], grades: Grade[]): number {
        const mandatorySubjects = profileCriteria.filter(s => s.type === ProfileCriteriaType.Mandatory);
        const alternativeSubjects = profileCriteria.filter(s => s.type === ProfileCriteriaType.Alternative);

        let points = 0;
        let alternativeGrades = []

        for (const grade of grades) {
            if (grade.type === GradeType.Exam)
                points += grade.grade * 0.35;
            else if (mandatorySubjects.some(s => s.subjectId == grade.subjectId))
                points += GRADE_TO_POINTS[grade.grade] || 0;
            else if (alternativeSubjects.some(s => s.subjectId == grade.subjectId))
                alternativeGrades.push(GRADE_TO_POINTS[grade.grade] || 0);
        }

        if (alternativeGrades.length > 0) points += Math.max(...alternativeGrades);

        return Math.ceil(points * 100) / 100;
    }
}