import {School} from "../entities/schoolModel";
import {ApplicationSubmission} from "./applicationSubmission";

export interface ApplicationSubmissionsBySchool {
    school: School;
    profiles: ApplicationSubmission[];
}