import { Queue } from '@app/classes/queue';
import { ImageUploadResult } from '@common/image.upload.result';
import { Pixel } from '@common/pixel';
import { Vector2 } from '@common/vector2';
import { Service } from 'typedi';

@Service()
export class ImageProcessingService {
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    private static readonly requiredImageWidth = 640;
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    private static readonly requiredImageHeight = 480;
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    private static readonly minDifferencesForHardMode = 7;
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    private static readonly hardModeImageSurfaceRequiredPercentage = 0.15;

    getDifferencesBlackAndWhiteImage = (imageBuffer1: Buffer, imageBuffer2: Buffer, radius: number): ImageUploadResult => {
        const imageOutput: Buffer = Buffer.from(imageBuffer1);

        const image1Dimensions: Vector2 = this.getImageDimensions(imageBuffer1);
        const image2Dimensions: Vector2 = this.getImageDimensions(imageBuffer2);

        if (
            image1Dimensions.x !== ImageProcessingService.requiredImageWidth ||
            image1Dimensions.y !== ImageProcessingService.requiredImageHeight ||
            image2Dimensions.x !== ImageProcessingService.requiredImageWidth ||
            image2Dimensions.y !== ImageProcessingService.requiredImageHeight
        )
            throw new Error(
                'Images must be 640x480! (img 1 ' +
                    image1Dimensions.x +
                    'x' +
                    image1Dimensions.y +
                    ') (img 2 ' +
                    image2Dimensions.x +
                    'x' +
                    image2Dimensions.y +
                    ')',
            );

        if (!this.is24BitDepthBMP(imageBuffer1) || !this.is24BitDepthBMP(imageBuffer2)) throw new Error('Images must be 24 bit depth BMPs!');

        const allDifferences: Vector2[][] = this.getDifferencesPositionsList(imageBuffer1, imageBuffer2, radius);

        // display the length of each difference group
        allDifferences.forEach((diffGroup, index) => {
            // eslint-disable-next-line no-console
            console.log('diff group length ' + index + ' : ' + diffGroup.length);
        });

        this.turnImageToWhite(imageOutput);
        let sumOfAllDifferences: Vector2[] = [];
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < allDifferences.length; i++) {
            sumOfAllDifferences = sumOfAllDifferences.concat(allDifferences[i]);
        }
        this.paintBlackPixelsAtPositions(sumOfAllDifferences, imageOutput);

        return {
            resultImageByteArray: Array.from(new Uint8Array(imageOutput)),
            numberOfDifferences: allDifferences.length,
            message: 'Success!',
            generatedGameId: -1,
            differences: allDifferences,
            isEasy: !this.isHard(allDifferences.length, sumOfAllDifferences),
        };
    };

    private isHard = (numberOfDifferences: number, sumOfAllDifferences: Vector2[]): boolean => {
        return (
            numberOfDifferences >= ImageProcessingService.minDifferencesForHardMode &&
            sumOfAllDifferences.length <=
                ImageProcessingService.requiredImageHeight *
                    ImageProcessingService.requiredImageWidth *
                    ImageProcessingService.hardModeImageSurfaceRequiredPercentage
        );
    };

    private getDifferentPixelPositionsBetweenImages = (imageBuffer1: Buffer, imageBuffer2: Buffer): Vector2[] => {
        try {
            // const imageWidth = imageBuffer1.readUInt32LE(ImageProcessingService.imageWidthOffset);
            // const imageHeight = imageBuffer1.readUInt32LE(ImageProcessingService.imageHeightOffset);

            const imageDimensions: Vector2 = this.getImageDimensions(imageBuffer1);

            const differences: Vector2[] = [];

            for (let y = 0; y < imageDimensions.y; y++) {
                for (let x = 0; x < imageDimensions.x; x++) {
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
            console.error('Could not get different pixel positions between images');
            return [];
        }
    };

    private paintBlackPixelsAtPositions = (positions: Vector2[], imageBuffer: Buffer): void => {
        try {
            positions.forEach((position) => {
                this.setRGB(position, imageBuffer, Pixel.black);
            });
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error('Cannot paint black pixels at theses given positions');
        }
    };

    // eslint-disable-next-line complexity
    private getDifferencesPositionsList = (imageBuffer1: Buffer, imageBuffer2: Buffer, radius: number): Vector2[][] => {
        const visitRadius = radius;
        const differencesList: Vector2[][] = [[]];
        let currentDifferenceGroupIndex = 0;
        const allPixelsToVisit: Vector2[] = this.getDifferentPixelPositionsBetweenImages(imageBuffer1, imageBuffer2);

        // This is a set of all pixels to visit, used to check if a pixel is supposed to be visited, regardless of the radius
        // It has a much better performance than checking if the pixel is in the allPixelsToVisit array since it's a set
        const allPixelsToVisitSet: Set<string> = new Set();
        allPixelsToVisit.forEach((pixel) => {
            allPixelsToVisitSet.add(pixel.x + ' ' + pixel.y);
        });

        // This is a map of all pixels that have been visited, and the radius of the visit
        const alreadyVisited: Map<string, number> = new Map();
        // This is a working queue of the next pixels to visit, and the radius of the visit (BFS algorithm)
        const nextPixelsToVisit: Queue<{ pos: Vector2; radius: number }> = new Queue();

        const imageDimensions: Vector2 = this.getImageDimensions(imageBuffer1);
        const imageWidth = imageDimensions.x;
        const imageHeight = imageDimensions.y;

        while (allPixelsToVisit.length > 0) {
            if (allPixelsToVisit.length > 0) {
                const nextPixel = allPixelsToVisit.pop();
                if (nextPixel !== undefined) nextPixelsToVisit.enqueue({ pos: nextPixel as Vector2, radius: visitRadius });
            }

            while (nextPixelsToVisit.length > 0) {
                const currentPixel = nextPixelsToVisit.dequeue() as { pos: Vector2; radius: number };

                // eslint-disable-next-line no-console
                // console.log(
                //     'Visiting ' + currentPixel.pos.x + ', ' + (imageHeight - (currentPixel.pos.y + 1)) + ' with radius ' + currentPixel.radius,
                // );

                // if this pixel hasn't been visited, add it to the list of differences
                if (!alreadyVisited.has(currentPixel.pos.x + ' ' + currentPixel.pos.y)) {
                    differencesList[currentDifferenceGroupIndex].push(currentPixel.pos);
                    alreadyVisited.set(currentPixel.pos.x + ' ' + currentPixel.pos.y, currentPixel.radius);
                } else {
                    // if the pixel was already visited, check if the radius was bigger at the time of the visit
                    const radiusOfTheVisitedPixelAtThatTime = alreadyVisited.get(currentPixel.pos.x + ' ' + currentPixel.pos.y);

                    if (radiusOfTheVisitedPixelAtThatTime !== undefined && currentPixel.radius > radiusOfTheVisitedPixelAtThatTime) {
                        alreadyVisited.set(currentPixel.pos.x + ' ' + currentPixel.pos.y, currentPixel.radius);
                    } else {
                        // if the radius was bigger, skip this pixel because visiting it again with a smaller radius would not change anything
                        continue;
                    }
                }

                for (let y = currentPixel.pos.y - 1; y <= currentPixel.pos.y + 1; y++) {
                    if (y < 0 || y >= imageHeight) continue;
                    for (let x = currentPixel.pos.x - 1; x <= currentPixel.pos.x + 1; x++) {
                        if (x < 0 || x >= imageWidth) continue;
                        const nextPixel = { x, y };
                        if (!alreadyVisited.has(nextPixel.x + ' ' + nextPixel.y)) {
                            // if our pixel has a radius bigger than 0, we visit the neighbor
                            // we also visit the neighbor if they are in the list of pixels to visit (allPixelsToVisitSet)
                            if (currentPixel.radius > 0 || allPixelsToVisitSet.has(nextPixel.x + ' ' + nextPixel.y)) {
                                // if this pixel is already in the list of pixels to visit, add it but with the maximum radius
                                nextPixelsToVisit.enqueue({
                                    pos: nextPixel,
                                    radius: allPixelsToVisitSet.has(nextPixel.x + ' ' + nextPixel.y) ? visitRadius : currentPixel.radius - 1,
                                });
                            }
                        }
                    }
                }
            }
            if (differencesList[currentDifferenceGroupIndex].length > 0 && allPixelsToVisit.length > 0) {
                differencesList.push([]);
                currentDifferenceGroupIndex++;
            }
        }
        if (differencesList[differencesList.length - 1].length === 0) differencesList.pop();
        return differencesList;
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
            console.error("OOPS! Couldn't get the RGB values for the pixel at position " + position.x + ', ' + position.y + '!');
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
            console.error("OOPS! Can't write pixel at position " + position.x + ', ' + position.y + '!');
        }
    };

    private getPixelBufferPosAtPixelPos = (position: Vector2, imageBuffer: Buffer): number => {
        // BMP file header is 54 bytes long, so the pixel data starts at byte 54
        const pixelStart = 54;

        // Each pixel is 3 bytes (BGR)
        const pixelLength = 3;

        const dimensions = this.getImageDimensions(imageBuffer);
        const imageWidth = dimensions.x;

        let yPosition: number;
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        if (this.isImageUsingTopDownFormat(imageBuffer)) {
            // Top-down BMP
            yPosition = position.y;
        } else {
            // Bottom-up BMP
            yPosition = dimensions.y - position.y - 1;
        }

        // Calculate the starting position of the pixel
        // return (position.x + position.y * imageBuffer.readUInt32LE(imageWidthOffset)) * pixelLength + pixelStart;
        return (position.x + yPosition * imageWidth) * pixelLength + pixelStart;
    };

    private getImageDimensions = (imageBuffer: Buffer): Vector2 => {
        const imageWidthOffset = 18;
        const imageHeightOffset = 22;

        const imageWidth = imageBuffer.readInt32LE(imageWidthOffset);
        let imageHeight = imageBuffer.readInt32LE(imageHeightOffset);

        if (imageHeight < 0) {
            imageHeight = -imageHeight;
        }

        return new Vector2(imageWidth, imageHeight);
    };

    private isImageUsingTopDownFormat = (imageBuffer: Buffer): boolean => {
        const imageHeightOffset = 22;
        const imageHeight = imageBuffer.readInt32LE(imageHeightOffset);

        return imageHeight < 0;
    };

    private is24BitDepthBMP = (imageBuffer: Buffer): boolean => {
        const BITMAP_TYPE_OFFSET = 28;
        const BIT_COUNT_24 = 24;
        return imageBuffer.readUInt16LE(BITMAP_TYPE_OFFSET) === BIT_COUNT_24;
    };

    private turnImageToWhite = (imageBuffer: Buffer): void => {
        try {
            const imageDimensions: Vector2 = this.getImageDimensions(imageBuffer);

            for (let y = 0; y < imageDimensions.y; y++) {
                for (let x = 0; x < imageDimensions.x; x++) {
                    this.setRGB({ x, y }, imageBuffer, Pixel.white);
                }
            }
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error('Cannot turn this image to white');
        }
    };
}
