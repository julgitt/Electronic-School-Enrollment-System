import {ProfileRepository} from "../repositories/profileRepository";
import {ProfileCriteriaEntity} from "../models/profileCriteriaEntity";
import {Profile} from "../dto/profile";
import {Grade} from "../dto/grade";

export class ProfileService {
    constructor(private profileRepository: ProfileRepository) {
    }

    static calculatePoints(profileCriteria: ProfileCriteriaEntity[], grades: Grade[]) {
        const mandatorySubjects = profileCriteria.filter(s => s.type === 'mandatory');
        const alternativeSubjects = profileCriteria.filter(s => s.type === 'alternative');
        let points = 0;

        let alternativeGrades = []
        for (let grade of grades) {
            if (grade.type == "exam") {
                points += grade.grade;
            } else if (grade.subjectId in mandatorySubjects) {
                points += grade.grade;
            } else if (grade.subjectId in alternativeSubjects) {
                alternativeGrades.push(grade.grade);
            }
        }
        return points + alternativeGrades.sort().pop()!;
    }

    async getProfile(profileId: number): Promise<Profile | null> {
        return this.profileRepository.getById(profileId);
    }

    getProfilesBySchool(schoolId: number): Promise<Profile[]> {
        return this.profileRepository.getAllBySchool(schoolId);
    }

    async getProfileCriteria(profileId: number): Promise<ProfileCriteriaEntity[]> {
        return this.profileRepository.getProfileCriteria(profileId);
    }


}