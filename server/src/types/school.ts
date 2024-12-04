import {Profile} from "../models/profileModel";

export interface School {
    id: number;
    name: string;
    profiles: Profile[];
}