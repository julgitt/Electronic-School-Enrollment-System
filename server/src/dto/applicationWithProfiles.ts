import {Profile} from "./profile";
import {SchoolWithProfiles} from "./schoolWithProfiles";

export interface ApplicationWithProfiles {
    id: number
    round: number;
    school: SchoolWithProfiles;
    profile: Profile;
    priority: number;
    status: string;
    submittedAt: Date | number;
    updatedAt: Date | number;
}
