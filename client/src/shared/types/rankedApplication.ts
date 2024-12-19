import {Candidate} from "./candidate.ts";

export type RankList = { accepted: RankedApplication[], reserve: RankedApplication[] };

export interface RankedApplication {
    id: number;
    candidate: Candidate;
    points: number;
    priority: number;
    status: string;
}
