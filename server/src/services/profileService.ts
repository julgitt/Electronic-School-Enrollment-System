import {ProfileRepository} from "../repositories/profileRepository";
import {ProfileCriteriaEntity, ProfileCriteriaType} from "../models/profileCriteriaEntity";
import {Profile} from "../dto/profile/profile";
import {ResourceNotFoundError} from "../errors/resourceNotFoundError";
import {ProfileCriteria} from "../dto/criteriaByProfile";
import {Grade} from "../dto/grade/grade";
import {ApplicationService} from "./applicationService";
import {GradeService} from "./gradeService";
import {Application} from "../dto/application/application";
import {ProfileRequest} from "../dto/profile/profileRequest";
import {transactionFunction} from "../db";
import {ProfileWithCriteria} from "../dto/profile/profileWithCriteria";
import {CandidateService} from "./candidateService";
import {RankedApplication, RankList} from "../dto/application/rankedApplication";
import {GRADE_TO_POINTS} from "../../../adminConstants";
import {GradeType} from "../dto/grade/gradeType";
import {GradesInfo, PointsInfo} from "../dto/grade/pointsInfo";
import {SubjectService} from "./subjectService";
import {ProfileWithInfo} from "../dto/profile/profileInfo";
import {SchoolService} from "./schoolService";
import {DataConflictError} from "../errors/dataConflictError";

export class ProfileService {
    private applicationService!: ApplicationService;
    private schoolService!: SchoolService;

    constructor(
        private profileRepository: ProfileRepository,
        private gradeService: GradeService,
        private subjectService: SubjectService,
        private candidateService: CandidateService,
        private readonly tx: transactionFunction
    ) {
    }

    setApplicationService(applicationService: ApplicationService) {
        this.applicationService = applicationService;
    }

    setSchoolService(schoolService: SchoolService) {
        this.schoolService = schoolService;
    }

    async getProfile(profileId: number): Promise<Profile> {
        const profile = await this.profileRepository.getById(profileId);
        if (!profile) throw new ResourceNotFoundError('Profil nie znaleziony.');
        return profile;
    }

    async getProfileByIdAndSchoolId(profileId: number, schoolId: number): Promise<ProfileWithCriteria> {
        const profile = await this.profileRepository.getById(profileId);
        if (!profile || profile.schoolId != schoolId) throw new ResourceNotFoundError('Profil nie znaleziony.');

        return {
            ...profile,
            criteria: await this.getProfileCriteria(profileId)
        };
    }

    async getProfileBySchool(schoolId: number): Promise<ProfileWithCriteria | null> {
        const profile = await this.profileRepository.getBySchool(schoolId);
        if (!profile) return null;

        return {
            ...profile,
            criteria: await this.getProfileCriteria(profile.id)
        };

    }

    async getProfilesBySchool(schoolId: number): Promise<Profile[]> {
        return this.profileRepository.getAllBySchool(schoolId);
    }

    async getAllProfiles(): Promise<Profile[]> {
        return this.profileRepository.getAll();
    }

    async getProfilesWithInfo() {
        const profiles = await this.getAllProfiles()
        const profilesInfo: ProfileWithInfo[] = await Promise.all(profiles.map(async p => {
            const school = (await this.schoolService.getSchool(p.schoolId))

            const criteria = await this.getProfileCriteria(p.id);
            const criteriaSubjects = await Promise.all(criteria.map(async c => {
                const subject = await this.subjectService.getSubject(c.subjectId);
                return subject.name;
            }));
            const applicationNumber = (await this.applicationService.getAllPendingByProfile(p.id)).length;

            return {id: p.id, name: p.name, school, criteriaSubjects, applicationNumber}
        }))

        return profilesInfo;
    }

    async deleteProfile(profileId: number, schoolId: number) {
        const profile = await this.profileRepository.getById(profileId);
        if (!profile || profile.schoolId != schoolId) throw new ResourceNotFoundError("Nie znaleziono profilu do usunięcia.");
        await this.profileRepository.delete(profileId, schoolId);
    }

    async addProfile(profile: ProfileRequest, schoolId: number) {
        if (await this.profileRepository.getBySchoolAndName(schoolId, profile.name))
            throw new DataConflictError("Profil o podanej nazwie już istnieje.");

        const newProfile: Profile = {
            id: 0,
            name: profile.name,
            capacity: profile.capacity,
            schoolId: schoolId,
        }

        await this.tx(async t => {
            const insertedProfile = await this.profileRepository.insert(newProfile, t);

            for (const criteria of profile.criteria) {
                const newProfileCriteria: ProfileCriteriaEntity = {
                    id: 0,
                    profileId: insertedProfile.id,
                    subjectId: criteria.subjectId,
                    type: criteria.type,
                }
                await this.profileRepository.insertCriteria(newProfileCriteria, t);
            }
        });
    }

    async updateProfile(profile: ProfileRequest, schoolId: number) {
        await this.getProfileByIdAndSchoolId(profile.id, schoolId);

        const updatedProfile: Profile = {
            id: profile.id,
            name: profile.name,
            capacity: profile.capacity,
            schoolId: schoolId,
        }

        await this.tx(async t => {
            await this.profileRepository.update(updatedProfile, t);
            await this.profileRepository.deleteCriteriaByProfile(updatedProfile.id, t);

            for (const criteria of profile.criteria) {
                const newProfileCriteria: ProfileCriteriaEntity = {
                    id: 0,
                    profileId: updatedProfile.id,
                    subjectId: criteria.subjectId,
                    type: criteria.type,
                }
                await this.profileRepository.insertCriteria(newProfileCriteria, t);
            }
        });
    }

    async getPoints(profileId: number, candidateId: number): Promise<PointsInfo> {
        const criteria = await this.getProfileCriteria(profileId);
        const grades: Grade[] = await this.gradeService.getAllByCandidate(candidateId);

        const gradesInfo: GradesInfo[] = (await Promise.all(grades
            .map((async g => {
                const criterion = criteria.find(c => c.subjectId == g.subjectId && g.type === GradeType.Certificate)
                return criterion ? {
                    grade: g.grade,
                    subject: (await this.subjectService.getSubject(g.subjectId)).name,
                    type: criterion.type
                } : null
            })))).filter(g => g !== null)

        return {points: this.calculatePoints(criteria, grades), gradesInfo};
    }

    async getAllRankLists() {
        const profiles = await this.getProfilesWithInfo();
        const rankLists = new Map<number, RankList>();

        for (const profile of profiles) {
            const {accepted, reserve} = await this.getRankList(profile.id);
            rankLists.set(profile.id, {profile, accepted, reserve, rejected: []});
        }

        return rankLists;
    }

    async getRankList(profileId: number) {
        const criteria = await this.getProfileCriteria(profileId);
        const accepted = await this.applicationService.getAllAcceptedByProfile(profileId);
        const pending = await this.applicationService.getAllPendingByProfile(profileId);

        const rankedAccepted = await this.createRankList(accepted, criteria);
        const rankedPending = await this.createRankList(pending, criteria);

        const profileCapacity = await this.getProfileCapacity(profileId);
        const capacity = profileCapacity - rankedAccepted.length;
        return {
            prevAccepted: rankedAccepted,
            accepted: rankedPending.slice(0, capacity),
            reserve: rankedPending.slice(capacity)
        };
    }

    private async createRankList(applications: Application[], criteria: ProfileCriteria[]) {
        const rankedApplications = await Promise.all(
            applications.map(a => this.toRankedApplication(criteria, a))
        );
        return rankedApplications.sort((a, b) => b.points - a.points);
    }

    private async toRankedApplication(criteria: ProfileCriteria[], application: Application): Promise<RankedApplication> {
        const candidate = await this.candidateService.getCandidateById(application.candidateId);
        const grades = await this.gradeService.getAllByCandidate(application.candidateId);

        const points = this.calculatePoints(criteria, grades);

        return {
            id: application.id,
            candidate,
            points,
            priority: application.priority,
            status: application.status
        }
    }

    private async getProfileCapacity(profileId: number) {
        const capacity = await this.profileRepository.getProfileCapacity(profileId);
        if (!capacity) throw new ResourceNotFoundError('Nie znaleziono liczby miejsc dla profilu.');
        return capacity
    }

    private async getProfileCriteria(profileId: number): Promise<ProfileCriteria[]> {
        const criteria: ProfileCriteriaEntity[] = await this.profileRepository.getProfileCriteria(profileId);
        if (!criteria) throw new ResourceNotFoundError('Nie znaleziono kryteriów dla profilu.');
        return criteria;
    }

    private calculatePoints(profileCriteria: ProfileCriteriaEntity[], grades: Grade[]): number {
        const mandatorySubjects = profileCriteria.filter(s => s.type === ProfileCriteriaType.Mandatory);
        const alternativeSubjects = profileCriteria.filter(s => s.type === ProfileCriteriaType.Alternative);
        let points = 0;

        let alternativeGrades = []
        for (let grade of grades) {
            if (grade.type == GradeType.Exam) {
                points += grade.grade * 0.35;
            } else if (mandatorySubjects.some(s => s.subjectId == grade.subjectId)) {
                points += GRADE_TO_POINTS[grade.grade] || 0;
            } else if (alternativeSubjects.some(s => s.subjectId == grade.subjectId)) {
                alternativeGrades.push(GRADE_TO_POINTS[grade.grade] || 0);
            }
        }
        if (alternativeGrades.length > 0) {
            points += Math.max(...alternativeGrades);
        }
        return Math.ceil(points * 100) / 100;
    }
}