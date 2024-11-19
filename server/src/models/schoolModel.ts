import { Profile } from "./profileModel";

export interface School {
    id?: number;
    name: string;
    profiles?: Profile[];
}