import { Vector2 } from './vector2';

export interface ImageUploadResult {
    resultImageByteArray: number[];
    numberOfDifferences: number;
    generatedGameId: number;
    message: string;
    differences: Vector2[][];
}
