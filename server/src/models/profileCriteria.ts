export interface ProfileCriteria {
    id: number;
    profileId: number;
    subjectId: number;
    type: "mandatory" | "alternative";
}