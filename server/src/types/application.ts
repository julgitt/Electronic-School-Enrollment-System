import {Profile} from "../models/profileModel";
import {School} from "./school";

export interface Application {
    id: number
    candidateId: number
    stage: number;
    school: School;
    profile: Profile;
    priority: number;
    status: string;
    submittedAt: Date | number;
    updatedAt: Date | number;
}
