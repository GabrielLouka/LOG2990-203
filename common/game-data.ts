import { Ranking } from '@common/ranking';
import { Vector2 } from './vector2';
export interface GameData {
    id: number;
    name: string;
    isEasy: boolean;
    nbrDifferences: number;
    differences: Vector2[][]; // array of all the pixels in a difference
    ranking: Ranking[][];
}

export const MIN_NBR_OF_DIFFERENCES = 3;
export const MAX_NBR_OF_DIFFERENCES = 9;
