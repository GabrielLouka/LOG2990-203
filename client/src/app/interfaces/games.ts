import { Ranking } from '../../../../common/classements';

export interface Game {
    description: string;
    image: string;
    difficulty: string;
    ranking: Ranking[][];
}
