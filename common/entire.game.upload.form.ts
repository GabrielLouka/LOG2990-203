import { DifferenceImage } from './difference.image';
import { Vector2 } from './vector2';

export interface EntireGameUploadForm {
    gameId: number;
    firstImage: DifferenceImage;
    secondImage: DifferenceImage;
    differences: Vector2[][];
    gameName: string;
}
