import {School} from "../../../shared/types/school.ts";
import {Profile} from "../../../shared/types/profile.ts";

export interface Selection {
    school: School | null;
    profiles: Profile[];
}