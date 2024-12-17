export enum ProfileCriteriaType {
    Mandatory = 'mandatory',
    Alternative = 'alternative',
}

export interface ProfileCriteria {
    id: number;
    profileId: number;
    subjectId: number;
    type: ProfileCriteriaType;
}

export interface Profile {
    id: number;
    name: string;
    criteria: ProfileCriteria[]
}