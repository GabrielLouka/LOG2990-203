import { Pixel } from '@app/classes/pixel';
import { Vector2 } from '@app/classes/vector2';
import { Service } from 'typedi';

@Service()
export class ImageProcessingService {
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    static readonly imageWidthOffset = 18;
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    static readonly imageHeightOffset = 22;

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

    getDifferentPixelPositionsBetweenImages = (imageBuffer1: Buffer, imageBuffer2: Buffer): Vector2[] => {
        try {
            const imageWidth = imageBuffer1.readUInt32LE(ImageProcessingService.imageWidthOffset);
            const imageHeight = imageBuffer1.readUInt32LE(ImageProcessingService.imageHeightOffset);

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

    // eslint-disable-next-line complexity
    getDifferencesPositionsList = (imageBuffer1: Buffer, imageBuffer2: Buffer, radius: number): Vector2[][] => {
        const visitRadius = radius;
        const differencesList: Vector2[][] = [[]];
        let currentDifferenceGroupIndex = 0;
        const pixelsToVisit: Vector2[] = this.getDifferentPixelPositionsBetweenImages(imageBuffer1, imageBuffer2);

        const alreadyVisited: Vector2[] = [];
        const nextPixelsToVisit: { pos: Vector2; radius: number }[] = [];

        const imageWidth = imageBuffer1.readUInt32LE(ImageProcessingService.imageWidthOffset);
        const imageHeight = imageBuffer1.readUInt32LE(ImageProcessingService.imageHeightOffset);

        while (pixelsToVisit.length > 0) {
            if (pixelsToVisit.length > 0) {
                const nextPixel = pixelsToVisit.pop();
                if (nextPixel !== undefined) nextPixelsToVisit.push({ pos: nextPixel as Vector2, radius: visitRadius });
            }

            while (nextPixelsToVisit.length > 0) {
                const currentPixel = nextPixelsToVisit.pop() as { pos: Vector2; radius: number };

                if (!alreadyVisited.some((pos) => pos.x === currentPixel.pos.x && pos.y === currentPixel.pos.y)) {
                    differencesList[currentDifferenceGroupIndex].push(currentPixel.pos);
                    alreadyVisited.push(currentPixel.pos);
                }

                if (currentPixel.radius > 0) {
                    for (let y = currentPixel.pos.y - 1; y <= currentPixel.pos.y + 1; y++) {
                        if (y < 0 || y >= imageHeight) continue;
                        for (let x = currentPixel.pos.x - 1; x <= currentPixel.pos.x + 1; x++) {
                            if (x < 0 || x >= imageWidth) continue;
                            const nextPixel = { x, y };
                            if (!alreadyVisited.some((pos) => pos.x === nextPixel.x && pos.y === nextPixel.y)) {
                                //  if next pixels to visit already contains the pixel, with a higher radius, don't do anything
                                // if (
                                //     nextPixelsToVisit.some(
                                //         (pixel) =>
                                //             pixel.pos.x === nextPixel.x && pixel.pos.y === nextPixel.y && pixel.radius > currentPixel.radius - 1,
                                //     )
                                // )
                                //     continue;

                                // if this pixel is already in the list of pixels to visit, add it but with the maximum radius
                                nextPixelsToVisit.push({
                                    pos: nextPixel,
                                    radius: pixelsToVisit.some((pos) => pos.x === nextPixel.x && pos.y === nextPixel.y)
                                        ? visitRadius
                                        : currentPixel.radius - 1,
                                });
                            }
                        }
                    }
                }
            }
            if (differencesList[currentDifferenceGroupIndex].length > 0 && pixelsToVisit.length > 0) {
                differencesList.push([]);
                currentDifferenceGroupIndex++;
            }
        }
        if (differencesList[differencesList.length - 1].length === 0) differencesList.pop();
        return differencesList;
    };

    getDifferencesBlackAndWhiteImage = (imageBuffer1: Buffer, imageBuffer2: Buffer, radius: number): Buffer => {
        try {
            const output: Buffer = Buffer.from(imageBuffer1);
            // const differences: Vector2[] = this.getDifferentPixelPositionsBetweenImages(imageBuffer1, imageBuffer2);
            const allDifferences: Vector2[][] = this.getDifferencesPositionsList(imageBuffer1, imageBuffer2, radius);
            const currentDifferences: Vector2[] = allDifferences[0];

            // display the length of each difference group
            allDifferences.forEach((diffGroup, index) => {
                // eslint-disable-next-line no-console
                console.log('diff group length ' + index + ' : ' + diffGroup.length);
            });

            this.turnImageToWhite(output);
            this.paintBlackPixelsAtPositions(currentDifferences, output);

            return output;
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e);
            return Buffer.from(imageBuffer1);
        }
    };

    private getRGB = (position: Vector2, imageBuffer: Buffer): Pixel | null => {
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

    private setRGB = (position: Vector2, imageBuffer: Buffer, pixel: Pixel): void => {
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
