import { Ranking } from '@common/ranking';

export interface Game {
    description: string;
    image: string;
    difficulty: string;
    ranking: Ranking[][];
}
