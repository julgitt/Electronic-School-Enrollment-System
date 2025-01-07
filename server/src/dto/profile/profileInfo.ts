import {School} from "../school/school";

export interface ProfileWithInfo {
    id: number;
    name: string;
    school: School
    applicationNumber: number;
    criteriaSubjects: string[];
}