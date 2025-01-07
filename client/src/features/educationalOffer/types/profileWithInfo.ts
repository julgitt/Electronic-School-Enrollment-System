import {School} from "../../admin/types/schoolRequest.ts";

export interface ProfileWithInfo {
    id: number;
    name: string;
    school: School;
    applicationNumber: number;
    criteriaSubjects: string[];
}