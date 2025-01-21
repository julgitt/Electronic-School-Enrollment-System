import { Application } from "../application/application";
import { ProfileCriteria } from "../criteriaByProfile";

export interface ProfileWithInfo {
    id: number;
    name: string;
    schoolId: number;
    schoolName: string
    accepted: Application[];
    pending: Application[];
    applicationNumber: number;
    criteriaSubjects: string[];
    criteria: ProfileCriteria[];
    capacity: number;
}