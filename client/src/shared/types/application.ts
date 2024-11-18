import {School} from "./school.ts";
import {Profile} from "./profile.ts";

export interface Application {
    id: number
    candidateId: number;
    stage: number;
    school: School;
    profile: Profile;
    status: string;
    submittedAt: Date;
}