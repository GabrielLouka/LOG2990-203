import { Pixel } from '@app/classes/pixel';
import { Service } from 'typedi';

@Service()
export class ImageProcessingService {
    getRGB = (x: number, y: number, imageBuffer: Buffer): Pixel | null => {
        try {
            // Read the BMP file
            const bmpBuffer = imageBuffer;

            // BMP file header is 54 bytes long, so the pixel data starts at byte 54
            const pixelStart = 54;

            // Each pixel is 3 bytes (BGR)
            const pixelLength = 3;

            const imageWidthOffset = 18;

            // Calculate the starting position of the pixel
            const pixelPosition = (x + y * bmpBuffer.readUInt32LE(imageWidthOffset)) * pixelLength + pixelStart;

            // Extract the R, G, and B values
            const b = bmpBuffer.readUInt8(pixelPosition);
            const g = bmpBuffer.readUInt8(pixelPosition + 1);
            const r = bmpBuffer.readUInt8(pixelPosition + 2);

            return new Pixel(r, g, b);
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e);
            return null;
        }
    };
}
