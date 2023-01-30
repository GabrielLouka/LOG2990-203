import { DifferenceImage } from './difference.image';
import { Vector2 } from './vector2';

export interface GameData {
    id: string;
    name: string;
    isEasy: boolean;
    nbrDifferences: number;
    originalImage: DifferenceImage;
    modifiedImage: DifferenceImage;
    differences: Vector2[][]; // array of all the pixels in a difference
}
