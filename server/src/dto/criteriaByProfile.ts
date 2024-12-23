import {ProfileCriteriaType} from "../models/profileCriteriaEntity";

export interface ProfileCriteria {
    id: number;
    profileId: number;
    subjectId: number;
    type: ProfileCriteriaType;
}

