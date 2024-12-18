export enum ProfileCriteriaType {
    Mandatory = 'mandatory',
    Alternative = 'alternative',
}

export interface ProfileCriteria {
    subjectId: number;
    type: ProfileCriteriaType;
}

export interface Profile {
    id: number
    name: string;
    capacity: number;
    criteria: ProfileCriteria[]
}