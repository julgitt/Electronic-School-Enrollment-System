export enum ProfileCriteriaType {
    Mandatory = 'mandatory',
    Alternative = 'alternative',
}

export interface ProfileCriteriaEntity {
    id: number;
    profileId: number;
    subjectId: number;
    type: ProfileCriteriaType;
}

export interface ProfileCriteriaWithSubjects {
    id: number;
    profileId: number;
    subjectId: number;
    subjectName: string;
    type: ProfileCriteriaType;
}