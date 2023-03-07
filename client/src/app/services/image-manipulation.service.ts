/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Injectable } from '@angular/core';
import { GameData } from '@common/game-data';
import { Pixel } from '@common/pixel';
import { Vector2 } from '@common/vector2';
import { Buffer } from 'buffer';

@Injectable({
    providedIn: 'root',
})
export class ImageManipulationService {
    // This will return an image source that can be used on a canvas from a buffer
    getImageSourceFromBuffer(buffer: Buffer): string {
        return `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`;
    }
    getImageDimensions = (imageBuffer: Buffer): Vector2 => {
        const imageWidthOffset = 18;
        const imageHeightOffset = 22;

        const imageWidth = imageBuffer.readInt32LE(imageWidthOffset);
        let imageHeight = imageBuffer.readInt32LE(imageHeightOffset);

        imageHeight = imageHeight < 0 ? -imageHeight : imageHeight;

        return new Vector2(imageWidth, imageHeight);
    };
    getModifiedImageWithoutDifferences(
        gameData: GameData,
        images: { originalImage: Buffer; modifiedImage: Buffer },
        foundDifferences: boolean[],
    ): Buffer {
        const output = Buffer.from(images.modifiedImage);

        // for some reason I need to use Buffer.from to make it work (cant use the originalImage directly)
        const ogImage = Buffer.from(images.originalImage);

        for (let i = 0; i < foundDifferences.length; i++) {
            if (foundDifferences[i]) {
                // if the difference was found, we need to remove it
                const positionInDifference = gameData.differences[i];
                for (const pos of positionInDifference) {
                    // get the pixel from the original image
                    const pixelFromTheOriginalImage = this.getRGB(pos, ogImage);
                    // set the pixel in the modified image
                    if (pixelFromTheOriginalImage !== null) {
                        this.setRGB(pos, output, pixelFromTheOriginalImage);
                    }
                }
            }
        }

        return output;
    }

    async blinkDifference(imageOld: Buffer, imageNew: Buffer, context: CanvasRenderingContext2D) {
        const numberOfBlinks = 3;
        const blinkTime = 100;

        this.loadCanvasImages(this.getImageSourceFromBuffer(imageNew), context);
        for (let i = 0; i < numberOfBlinks; i++) {
            await this.sleep(blinkTime);
            this.loadCanvasImages(this.getImageSourceFromBuffer(imageOld), context);
            await this.sleep(blinkTime);
            this.loadCanvasImages(this.getImageSourceFromBuffer(imageNew), context);
        }
    }

    async alternateOldNewImage(imageOld: Buffer, imageNew: Buffer, context: CanvasRenderingContext2D){                        
        await Promise.race([
            this.loadCanvasImages(this.getImageSourceFromBuffer(imageNew), context),
            this.loadCanvasImages(this.getImageSourceFromBuffer(imageOld), context)
        ])                       
    } 
    // was removed??? 
    loadCurrentImage(image: Buffer, context: CanvasRenderingContext2D){
        this.loadCanvasImages(this.getImageSourceFromBuffer(image), context);                
    }


    async sleep(time: number) {
        return new Promise((resolve) => {
            setTimeout(resolve, time);
        });
    }

    loadCanvasImages(srcImg: string, context: CanvasRenderingContext2D) {
        const img = new Image();
        img.src = srcImg;
        img.onload = () => {
            context.drawImage(img, 0, 0, 640, 480, 0, 0, 640, 480);
        };
    }

    private getRGB = (position: Vector2, imageBuffer: Buffer): Pixel | null => {
        try {
            const pixelPosition = this.getPixelBufferPosAtPixelPos(position, imageBuffer);

            // Extract the R, G, and B values
            const b = imageBuffer.readUInt8(pixelPosition);
            const g = imageBuffer.readUInt8(pixelPosition + 1);
            const r = imageBuffer.readUInt8(pixelPosition + 2);

            return new Pixel(r, g, b);
        } catch (e) {
            alert(e);
            alert("OOPS! Couldn't get the RGB values for the pixel at position " + position.x + ', ' + position.y + '!');
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
            alert(e);
            alert("OOPS! Can't write pixel at position " + position.x + ', ' + position.y + '!');
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
        if (!this.isImageUsingTopDownFormat(imageBuffer)) {
            // Bottom Up BMP
            yPosition = position.y;
        } else {
            // Top Down BMP
            yPosition = dimensions.y - position.y - 1;
        }

        return (position.x + yPosition * imageWidth) * pixelLength + pixelStart;
    };

    private isImageUsingTopDownFormat = (imageBuffer: Buffer): boolean => {
        const imageHeightOffset = 22;
        const imageHeight = imageBuffer.readInt32LE(imageHeightOffset);

        return imageHeight < 0;
    };
}
