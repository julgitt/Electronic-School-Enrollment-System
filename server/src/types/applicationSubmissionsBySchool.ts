import {School} from "../models/schoolModel";
import {ApplicationSubmission} from "./applicationSubmission";

export interface ApplicationSubmissionsBySchool {
    school: School;
    profiles: ApplicationSubmission[];
}