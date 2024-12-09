import {ApplicationRequest} from "./applicationRequest";
import {SchoolWithProfiles} from "./schoolWithProfiles";

export interface ApplicationBySchool {
    school: SchoolWithProfiles;
    profiles: ApplicationRequest[];
}