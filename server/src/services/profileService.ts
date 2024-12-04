import { ProfileRepository } from "../repositories/profileRepository";
import { Profile } from "../models/profileModel";
import { ProfileCriteria } from "../models/profileCriteria";
import { Grade } from "../models/gradeModel";

export class ProfileService {
    constructor(private profileRepository: ProfileRepository) {
        this.profileRepository = profileRepository;
    }

    async getProfile(profileId: number): Promise<Profile | null> {
        return this.profileRepository.getById(profileId);
    }

    async getProfileCriteria(profileId: number): Promise<ProfileCriteria[]> {
        return this.profileRepository.getProfileCriteria(profileId);
    }

    static calculatePoints(profileCriteria: ProfileCriteria[],grades: Grade[]) {
        const mandatorySubjects = profileCriteria.filter(s => s.type === 'mandatory');
        const alternativeSubjects = profileCriteria.filter(s => s.type === 'alternative');
        let points = 0;

        let alternativeGrades = []
        for (let grade of grades) {
            if (grade.type == "exam") {
                points += grade.grade;
            } else if (grade.subjectId in mandatorySubjects) {
                points += grade.grade;
            } else  if (grade.subjectId in alternativeSubjects) {
                alternativeGrades.push(grade.grade);
            }
        }
        return points + alternativeGrades.sort().pop()!;
    }


}