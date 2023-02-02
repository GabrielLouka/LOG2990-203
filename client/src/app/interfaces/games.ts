import { Classements } from './classements';

export interface Game {
    description: string;
    image: string;
    difficulty: string;
    mode: string;
    nbHints: number;
    hintsPenalty: number;
    ranking: Classements[][];
}
