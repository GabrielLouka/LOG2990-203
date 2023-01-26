import { DifferenceImage } from './difference.image';

export interface ImageUploadForm {
    firstImage: DifferenceImage;
    secondImage: DifferenceImage;
    radius: number;
}
