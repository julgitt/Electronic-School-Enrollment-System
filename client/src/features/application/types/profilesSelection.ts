import {School} from "../../../shared/types/school.ts";
import {UserSelectedProfile} from "./userSelectedProfile.ts";
import {Profile} from "../../../shared/types/profile.ts";

export interface ProfilesSelection {
    school: School | null;
    profiles: UserSelectedProfile[];
}

export interface ProfileSelection {
    school: School | null;
    profile: Profile | null;
}