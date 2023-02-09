import { DifferenceImage } from './difference.image';
import { Vector2 } from './vector2';

// After the client sends the ImageUploadForm, the server sends back an ImageUploadResult
// Then, the client sends the EntireGameUploadForm which contains everything the server needs
// to save the game, including the name of the game
export interface EntireGameUploadForm {
    gameId: number;
    firstImage: DifferenceImage;
    secondImage: DifferenceImage;
    differences: Vector2[][];
    gameName: string;
    isEasy: boolean;
}
