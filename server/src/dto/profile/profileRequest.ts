import {ProfileCriteria} from "../criteriaByProfile";

export interface ProfileRequest {
    id: number;
    name: string;
    capacity: number;
    criteria: ProfileCriteria[]
}