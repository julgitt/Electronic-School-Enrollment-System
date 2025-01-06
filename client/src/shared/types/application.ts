import {SchoolWithProfiles} from "./schoolWithProfiles.ts";
import {Profile} from "./profile.ts";

export interface Application {
    id: number
    candidateId: number;
    round: number;
    school: SchoolWithProfiles;
    profile: Profile;
    priority: number;
    status: string;
    createdAt: Date;
}