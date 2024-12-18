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

export class ProfileService {
    private applicationService!: ApplicationService;

    constructor(
        private profileRepository: ProfileRepository,
        private gradeService: GradeService,
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
        const profile  = await this.profileRepository.getBySchool(schoolId);
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

    async deleteProfile(profileId: number, schoolId:  number) {
        return this.profileRepository.delete(profileId, schoolId);
    }

    async addProfile(profile: ProfileRequest, schoolId: number){
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

    async updateProfile(profile: ProfileRequest, schoolId: number){
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

    async createSortedCandidateListsByProfile() {
        const profiles = await this.getAllProfiles();
        const sortedCandidateLists = new Map<number, { accepted: Application[], reserve: Application[] }>();

        for (const profile of profiles) {
            const {accepted, reserve} = await this.getSortedCandidateList(profile.id);
            sortedCandidateLists.set(profile.id, {accepted, reserve});
        }

        return sortedCandidateLists;
    }

    async getSortedCandidateList(profileId:  number) {
        const profileCapacity = await this.getProfileCapacity(profileId);
        const acceptedBefore = await this.applicationService.getAllAcceptedByProfile(profileId);
        const capacity = profileCapacity - acceptedBefore.length;

        const applications = await this.createSortedCandidateListForProfile(profileId);

        const accepted = applications.slice(0, capacity);
        const reserve = applications.slice(capacity);
        return {acceptedBefore, accepted, reserve};
    }

    private async getProfileCapacity(profileId: number){
        const capacity = await this.profileRepository.getProfileCapacity(profileId);
        if (!capacity) throw new ResourceNotFoundError('Nie znaleziono liczby miejsc dla profilu.');
        return capacity
    }

    private async createSortedCandidateListForProfile(profileId: number) {
        const criteria = await this.getProfileCriteria(profileId);

        const applications = await this.applicationService.getAllPendingApplicationsByProfile(profileId);
        const gradedCandidates = await Promise.all(
            applications.map(async (application) => ({
                application,
                grades: await this.gradeService.getAllByCandidate(application.candidateId),
            }))
        );

        return gradedCandidates.sort((a, b) =>
            this.calculatePoints(criteria, a.grades) - this.calculatePoints(criteria, b.grades)
        )
            .map((a => a.application));
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
            if (grade.type == "exam") {
                points += grade.grade * 0.2;
            } else if (mandatorySubjects.some(s => s.id == grade.subjectId)) {
                points += grade.grade;
            } else if (alternativeSubjects.some(s => s.id == grade.subjectId)) {
                alternativeGrades.push(grade.grade);
            }
        }
        if (alternativeGrades.length > 0) {
            points += Math.max(...alternativeGrades);
        }
        return points;
    }
}