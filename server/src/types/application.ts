import {School} from "../models/schoolModel";
import {Profile} from "../models/profileModel";

export interface Application {
    id: number
    stage: number;
    school: School;
    profile: Profile;
    priority: number;
    status: string;
    submittedAt: Date | number;
    updatedAt: Date | number;
}
