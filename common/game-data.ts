import { Vector2 } from './vector2';

export interface GameData {
    id: number;
    name: string;
    isEasy: boolean;
    nbrDifferences: number;
    differences: Vector2[][]; // array of all the pixels in a difference
}
