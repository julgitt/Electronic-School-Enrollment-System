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
import {RankedApplication} from "../dto/application/rankedApplication";
import {GRADE_TO_POINTS} from "../../../adminConstants";
import {GradeType} from "../dto/grade/gradeType";

export class ProfileService {
    private applicationService!: ApplicationService;

    constructor(
        private profileRepository: ProfileRepository,
        private gradeService: GradeService,
        private candidateService: CandidateService,
        private readonly tx: transactionFunction
    ) {
    }

    setApplicationService(applicationService: ApplicationService) {
        this.applicationService = applicationService;
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

    async deleteProfile(profileId: number, schoolId: number) {
        return this.profileRepository.delete(profileId, schoolId);
    }

    async addProfile(profile: ProfileRequest, schoolId: number) {
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

    async getAllRankLists() {
        const profiles = await this.getAllProfiles();
        const rankLists = new Map<number, { accepted: RankedApplication[], reserve: RankedApplication[], rejected: RankedApplication[] }>();

        for (const profile of profiles) {
            const {accepted, reserve} = await this.getRankList(profile.id);
            rankLists.set(profile.id, {accepted, reserve, rejected: []});
        }

        return rankLists;
    }

    async getRankList(profileId: number) {
        const criteria = await this.getProfileCriteria(profileId);
        const accepted = await this.applicationService.getAllAcceptedByProfile(profileId);
        const pending = await this.applicationService.getAllPendingApplicationsByProfile(profileId);

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

    private calculatePoints(profileCriteria: ProfileCriteriaEntity[], grades: Grade[]) {
        const mandatorySubjects = profileCriteria.filter(s => s.type === ProfileCriteriaType.Mandatory);
        const alternativeSubjects = profileCriteria.filter(s => s.type === ProfileCriteriaType.Alternative);
        let points = 0;

        let alternativeGrades = []
        for (let grade of grades) {
            if (grade.type == GradeType.Exam) {
                points += grade.grade * 0.35;
            } else if (mandatorySubjects.some(s => s.id == grade.subjectId)) {
                points += GRADE_TO_POINTS[grade.grade] || 0;
            } else if (alternativeSubjects.some(s => s.id == grade.subjectId)) {
                alternativeGrades.push(GRADE_TO_POINTS[grade.grade] || 0);
            }
        }
        if (alternativeGrades.length > 0) {
            points += Math.max(...alternativeGrades);
        }
        return Math.ceil(points * 100) / 100;
    }
}