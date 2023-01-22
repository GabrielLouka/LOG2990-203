import { Pixel } from '@app/classes/pixel';
import { Vector2 } from '@app/classes/vector2';
import { Service } from 'typedi';

@Service()
export class ImageProcessingService {
    getRGB = (position: Vector2, imageBuffer: Buffer): Pixel | null => {
        try {
            const pixelPosition = this.getPixelBufferPosAtPixelPos(position, imageBuffer);

            // Extract the R, G, and B values
            const b = imageBuffer.readUInt8(pixelPosition);
            const g = imageBuffer.readUInt8(pixelPosition + 1);
            const r = imageBuffer.readUInt8(pixelPosition + 2);

            return new Pixel(r, g, b);
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e);
            return null;
        }
    };

    setRGB = (position: Vector2, imageBuffer: Buffer, pixel: Pixel): void => {
        try {
            const pixelPosition = this.getPixelBufferPosAtPixelPos(position, imageBuffer);

            // Set the R, G, and B values
            imageBuffer.writeUInt8(pixel.b, pixelPosition);
            imageBuffer.writeUInt8(pixel.g, pixelPosition + 1);
            imageBuffer.writeUInt8(pixel.r, pixelPosition + 2);
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e);
        }
    };

    setHalfOfImageToBlack = (imageBuffer: Buffer): void => {
        try {
            const imageWidthOffset = 18;
            const imageHeightOffset = 22;

            const imageWidth = imageBuffer.readUInt32LE(imageWidthOffset);
            const imageHeight = imageBuffer.readUInt32LE(imageHeightOffset);

            for (let y = 0; y < imageHeight; y++) {
                for (let x = 0; x < imageWidth / 2; x++) {
                    this.setRGB({ x, y }, imageBuffer, new Pixel(0, 0, 0));
                }
            }
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e);
        }
    };

    turnImageToWhite = (imageBuffer: Buffer): void => {
        try {
            const imageWidthOffset = 18;
            const imageHeightOffset = 22;

            const imageWidth = imageBuffer.readUInt32LE(imageWidthOffset);
            const imageHeight = imageBuffer.readUInt32LE(imageHeightOffset);

            for (let y = 0; y < imageHeight; y++) {
                for (let x = 0; x < imageWidth; x++) {
                    this.setRGB({ x, y }, imageBuffer, Pixel.white);
                }
            }
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e);
        }
    };

    getDifferencesBetweenImages = (imageBuffer1: Buffer, imageBuffer2: Buffer): Vector2[] => {
        try {
            const imageWidthOffset = 18;
            const imageHeightOffset = 22;

            const imageWidth = imageBuffer1.readUInt32LE(imageWidthOffset);
            const imageHeight = imageBuffer1.readUInt32LE(imageHeightOffset);

            const differences: Vector2[] = [];

            for (let y = 0; y < imageHeight; y++) {
                for (let x = 0; x < imageWidth; x++) {
                    const pixel1 = this.getRGB({ x, y }, imageBuffer1);
                    const pixel2 = this.getRGB({ x, y }, imageBuffer2);

                    if (pixel1 !== null && pixel2 !== null && !pixel1.equals(pixel2)) {
                        differences.push({ x, y });
                    }
                }
            }

            return differences;
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e);
            return [];
        }
    };

    paintBlackPixelsAtPositions = (positions: Vector2[], imageBuffer: Buffer): void => {
        try {
            positions.forEach((position) => {
                this.setRGB(position, imageBuffer, Pixel.black);
            });
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e);
        }
    };

    getDifferencesBlackAndWhiteImage = (imageBuffer1: Buffer, imageBuffer2: Buffer): Buffer => {
        try {
            const output: Buffer = Buffer.from(imageBuffer1);
            // eslint-disable-next-line no-unused-vars
            const differences: Vector2[] = this.getDifferencesBetweenImages(imageBuffer1, imageBuffer2);

            this.turnImageToWhite(output);
            this.paintBlackPixelsAtPositions(differences, output);

            return output;
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e);
            return Buffer.from(imageBuffer1);
        }
    };

    private getPixelBufferPosAtPixelPos = (position: Vector2, imageBuffer: Buffer): number => {
        // BMP file header is 54 bytes long, so the pixel data starts at byte 54
        const pixelStart = 54;

        // Each pixel is 3 bytes (BGR)
        const pixelLength = 3;

        const imageWidthOffset = 18;

        // Calculate the starting position of the pixel
        return (position.x + position.y * imageBuffer.readUInt32LE(imageWidthOffset)) * pixelLength + pixelStart;
    };
}
