export interface ProfileCriteriaEntity {
    id: number;
    profileId: number;
    subjectId: number;
    type: "mandatory" | "alternative";
}