import {ApplicationRequest} from "./applicationRequest";
import {SchoolWithProfiles} from "../school/schoolWithProfiles";

export interface ApplicationBySchool {
    school: SchoolWithProfiles;
    profiles: ApplicationRequest[];
}