import {Profile} from "../profile/profile";

export interface SchoolWithProfiles {
    id: number;
    name: string;
    profiles: Profile[];
}