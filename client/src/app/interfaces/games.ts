import { Classements } from './classements';

export interface Game {
    description: string;
    image: string;
    difficulty: string;
    ranking: Classements[][];
}
