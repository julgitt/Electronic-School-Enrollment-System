import {SchoolWithProfiles} from "../../../shared/types/schoolWithProfiles.ts";
import {UserSelectedProfile} from "./userSelectedProfile.ts";
import {Profile} from "../../../shared/types/profile.ts";

export interface ProfilesSelection {
    school: SchoolWithProfiles | null;
    profiles: UserSelectedProfile[];
}

export interface ProfileSelection {
    school: SchoolWithProfiles | null;
    profile: Profile | null;
}