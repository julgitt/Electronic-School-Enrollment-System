import {ProfileCriteria} from "../criteriaByProfile";

export interface ProfileWithCriteria {
    id: number;
    name: string;
    capacity: number;
    criteria: ProfileCriteria[]
}