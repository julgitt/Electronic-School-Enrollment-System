import {Profile} from "../profile/profile";
import {SchoolWithProfiles} from "../school/schoolWithProfiles";

export interface ApplicationWithProfiles {
    id: number
    round: number;
    school: SchoolWithProfiles;
    profile: Profile;
    priority: number;
    status: string;
    createdAt: Date | number;
    updatedAt: Date | number;
}
