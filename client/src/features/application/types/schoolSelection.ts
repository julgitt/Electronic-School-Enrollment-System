import {School} from "../../../shared/types/school.ts";
import {UserSelectedProfile} from "./userSelectedProfile.ts";

export interface SchoolSelection {
    school: School | null;
    profiles: UserSelectedProfile[];
}