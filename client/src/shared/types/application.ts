import {School} from "./school.ts";
import {Profile} from "./profile.ts";

export interface Application {
    id: number
    candidateId: number;
    stage: number;
    school: School;
    profile: Profile;
    priority: number;
    status: string;
    submittedAt: Date;
}