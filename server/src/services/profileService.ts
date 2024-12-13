import {ProfileRepository} from "../repositories/profileRepository";
import {ProfileCriteriaEntity} from "../models/profileCriteriaEntity";
import {Profile} from "../dto/profile";
import {ResourceNotFoundError} from "../errors/resourceNotFoundError";
import {CriteriaByProfiles, ProfileCriteria} from "../dto/criteriaByProfile";

export class ProfileService {
    constructor(private profileRepository: ProfileRepository) {}

    async getProfile(profileId: number): Promise<Profile> {
        const profile = await this.profileRepository.getById(profileId);
        if (!profile) throw new ResourceNotFoundError('Profile not found.');
        return profile;
    }

    getProfilesBySchool(schoolId: number): Promise<Profile[]> {
        return this.profileRepository.getAllBySchool(schoolId);
    }

    async getAllProfiles(): Promise<Profile[]> {
        return this.profileRepository.getAll();
    }

    async getAllProfilesCriteria(): Promise<CriteriaByProfiles> {
        const allCriteria: ProfileCriteriaEntity[] = await this.profileRepository.getAllProfilesCriteria();

        const profilesCriteriaMap = new Map<number, ProfileCriteria[]>();

        allCriteria.forEach(criteria => {
            if (!profilesCriteriaMap.has(criteria.profileId)) {
                profilesCriteriaMap.set(criteria.profileId, []);
            }
            profilesCriteriaMap.get(criteria.profileId)?.push(criteria);
        });

        return profilesCriteriaMap;
    }
}