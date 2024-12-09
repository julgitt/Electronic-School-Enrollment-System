import {Profile} from "./profile";

export interface SchoolWithProfiles {
    id: number;
    name: string;
    profiles: Profile[];
}