import { Pixel } from '@app/classes/pixel';
import { Queue } from '@app/classes/queue';
import { Vector2 } from '@app/classes/vector2';
import { Service } from 'typedi';

@Service()
export class ImageProcessingService {
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    private static readonly requiredImageWidth = 640;
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    private static readonly requiredImageHeight = 480;

    turnImageToWhite = (imageBuffer: Buffer): void => {
        try {
            const imageDimensions: Vector2 = this.getImageDimensions(imageBuffer);

            // eslint-disable-next-line no-console
            console.log('Image dimensions to turn white ' + imageDimensions.x + 'x' + imageDimensions.y);

            for (let y = 0; y < imageDimensions.y; y++) {
                for (let x = 0; x < imageDimensions.x; x++) {
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
            // const imageWidth = imageBuffer1.readUInt32LE(ImageProcessingService.imageWidthOffset);
            // const imageHeight = imageBuffer1.readUInt32LE(ImageProcessingService.imageHeightOffset);

            const imageDimensions: Vector2 = this.getImageDimensions(imageBuffer1);
            const imageDimensions2: Vector2 = this.getImageDimensions(imageBuffer2);

            // eslint-disable-next-line no-console
            console.log('Image dimensions 1: ' + imageDimensions.x + 'x' + imageDimensions.y);
            // eslint-disable-next-line no-console
            console.log('Image dimensions 2: ' + imageDimensions2.x + 'x' + imageDimensions2.y);

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

        const visitedRadius: { pos: Vector2; radius: number }[] = [];
        const alreadyVisited: Set<string> = new Set();
        const nextPixelsToVisit: Queue<{ pos: Vector2; radius: number }> = new Queue();

        const imageDimensions: Vector2 = this.getImageDimensions(imageBuffer1);
        const imageWidth = imageDimensions.x;
        const imageHeight = imageDimensions.y;

        while (pixelsToVisit.length > 0) {
            if (pixelsToVisit.length > 0) {
                const nextPixel = pixelsToVisit.pop();
                if (nextPixel !== undefined) nextPixelsToVisit.enqueue({ pos: nextPixel as Vector2, radius: visitRadius });
            }

            while (nextPixelsToVisit.length > 0) {
                const currentPixel = nextPixelsToVisit.dequeue() as { pos: Vector2; radius: number };

                // eslint-disable-next-line no-console
                // console.log(
                //     'Visiting ' + currentPixel.pos.x + ', ' + (imageHeight - (currentPixel.pos.y + 1)) + ' with radius ' + currentPixel.radius,
                // );

                // see if the pixel was already visited

                // if this pixel hasn't been visited, add it to the list of differences
                if (!alreadyVisited.has(currentPixel.pos.x + ' ' + currentPixel.pos.y)) {
                    differencesList[currentDifferenceGroupIndex].push(currentPixel.pos);
                    visitedRadius.push({ pos: currentPixel.pos, radius: currentPixel.radius });
                    alreadyVisited.add(currentPixel.pos.x + ' ' + currentPixel.pos.y);
                } else {
                    // if the pixel was already visited, check if the radius is bigger
                    const eventualClone = visitedRadius.find((pixelData) => {
                        return pixelData.pos.x === currentPixel.pos.x && pixelData.pos.y === currentPixel.pos.y;
                    });

                    if (eventualClone !== undefined && currentPixel.radius > eventualClone.radius) {
                        eventualClone.radius = currentPixel.radius;
                    } else {
                        continue;
                    }
                }

                for (let y = currentPixel.pos.y - 1; y <= currentPixel.pos.y + 1; y++) {
                    if (y < 0 || y >= imageHeight) continue;
                    for (let x = currentPixel.pos.x - 1; x <= currentPixel.pos.x + 1; x++) {
                        if (x < 0 || x >= imageWidth) continue;
                        const nextPixel = { x, y };
                        if (!alreadyVisited.has(nextPixel.x + ' ' + nextPixel.y)) {
                            if (currentPixel.radius > 0 || pixelsToVisit.some((pos) => pos.x === nextPixel.x && pos.y === nextPixel.y)) {
                                // if this pixel is already in the list of pixels to visit, add it but with the maximum radius
                                nextPixelsToVisit.enqueue({
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
        const output: Buffer = Buffer.from(imageBuffer1);

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

        this.turnImageToWhite(output);
        let sumOfAllDifferences: Vector2[] = [];
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < allDifferences.length; i++) {
            sumOfAllDifferences = sumOfAllDifferences.concat(allDifferences[i]);
        }
        this.paintBlackPixelsAtPositions(sumOfAllDifferences, output);

        return output;
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
            console.error(e);
            // eslint-disable-next-line no-console
            console.error("OOPS! Can't write pixel at position " + position.x + ', ' + position.y + '!');
        }
    };

    private getPixelBufferPosAtPixelPos = (position: Vector2, imageBuffer: Buffer): number => {
        // BMP file header is 54 bytes long, so the pixel data starts at byte 54
        const pixelStart = 54;

        // Each pixel is 3 bytes (BGR)
        const pixelLength = 3;

        const imageWidth = this.getImageDimensions(imageBuffer).x;

        // Calculate the starting position of the pixel
        // return (position.x + position.y * imageBuffer.readUInt32LE(imageWidthOffset)) * pixelLength + pixelStart;
        return (position.x + position.y * imageWidth) * pixelLength + pixelStart;
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

    private is24BitDepthBMP = (imageBuffer: Buffer): boolean => {
        const BITMAP_TYPE_OFFSET = 28;
        const BIT_COUNT_24 = 24;
        return imageBuffer.readUInt16LE(BITMAP_TYPE_OFFSET) === BIT_COUNT_24;
    };

    // private getImageDimensions = (imageBuffer: Buffer): Vector2 => {
    //     let width = 0;
    //     let height = 0;
    //     // let pixelStart = 0;

    //     const imageWidthOffset = 18;
    //     const imageHeightOffset = 22;

    //     // Check if the file has a BITMAPCOREHEADER or a BITMAPINFOHEADER
    //     // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    //     if (imageBuffer.readUInt16LE(14) === 12) {
    //         // BITMAPCOREHEADER
    //         width = imageBuffer.readUInt16LE(imageWidthOffset);
    //         height = imageBuffer.readUInt16LE(imageHeightOffset);
    //     } else {
    //         // BITMAPINFOHEADER
    //         width = imageBuffer.readInt32LE(imageWidthOffset);
    //         height = imageBuffer.readInt32LE(imageHeightOffset);
    //         // pixelStart = imageBuffer.readUInt32LE(10);
    //     }

    //     // Check if the height is negative (indicates a top-down DIB)
    //     if (height < 0) {
    //         height = -height;
    //     }

    //     return { x: width, y: height };
    // };
}
