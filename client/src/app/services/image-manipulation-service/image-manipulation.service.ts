import { ElementRef, Injectable } from '@angular/core';
import { Pixel } from '@common/classes/pixel';
import { Vector2 } from '@common/classes/vector2';
import { GameData } from '@common/interfaces/game-data';
import {
    BLINK_TIME,
    BMP_FILE_HEADER_BYTES_LENGTH,
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    IMAGE_HEIGHT_OFFSET,
    IMAGE_WIDTH_OFFSET, NUMBER_OF_BLINKS,
    PIXEL_BYTES_LENGTH,
    QUARTER_SECOND
} from '@common/utils/env';
import { Buffer } from 'buffer';

@Injectable({
    providedIn: 'root',
})
export class ImageManipulationService {
    // can be used on a canvas from a buffer
    getImageSourceFromBuffer(buffer: Buffer): string {
        return `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`;
    }

    getImageDimensions = (imageBuffer: Buffer): Vector2 => {
        const imageWidth = imageBuffer.readInt32LE(IMAGE_WIDTH_OFFSET);
        let imageHeight = imageBuffer.readInt32LE(IMAGE_HEIGHT_OFFSET);

        imageHeight = imageHeight < 0 ? -imageHeight : imageHeight;

        return new Vector2(imageWidth, imageHeight);
    };

    getModifiedImageWithoutDifferences(
        gameData: GameData,
        images: { originalImage: Buffer; modifiedImage: Buffer },
        foundDifferences: boolean[],
    ): Buffer {
        const modifiedImageBuffer = Buffer.from(images.modifiedImage);
        const originalImageBuffer = Buffer.from(images.originalImage);

        for (let i = 0; i < foundDifferences.length; i++) {
            if (foundDifferences[i]) {
                // if the difference was found, we need to remove it
                const positionInDifference = gameData.differences[i];
                for (const pos of positionInDifference) {
                    const pixelFromTheOriginalImage = this.getRGB(pos, originalImageBuffer);
                    if (pixelFromTheOriginalImage) {
                        this.setRGB(pos, modifiedImageBuffer, pixelFromTheOriginalImage);
                    }
                }
            }
        }
        return modifiedImageBuffer;
    }

    async showFirstHint(
        canvasContext : {context: CanvasRenderingContext2D, canvas: ElementRef<HTMLCanvasElement>, imageNew: Buffer, original: Buffer}, 
        game: GameData, differences: boolean[]){
        
        const width = canvasContext.canvas.nativeElement.width;
        const height = canvasContext.canvas.nativeElement.height;
        const quarterWidth = width / 2;
        const quarterHeight = height / 2;
        
        
        const rects = [
            { x: 0, y: 0, width: quarterWidth, height: quarterHeight },
            { x: quarterWidth, y: 0, width: quarterWidth, height: quarterHeight },
            { x: 0, y: quarterHeight, width: quarterWidth, height: quarterHeight },
            { x: quarterWidth, y: quarterHeight, width: quarterWidth, height: quarterHeight }
        ];
        
        let rect;
        let randomIndex = Math.floor(Math.random() * game.differences.length)
        let randomDifference = game.differences[randomIndex];
        let randomVector = randomDifference[Math.floor(Math.random() * randomDifference.length)];     
        let diffFound = differences[randomIndex];
        do {
            let randomSection = Math.floor(Math.random() * 4);
            randomIndex = Math.floor(Math.random() * game.differences.length)
            randomDifference = game.differences[randomIndex];
            randomVector = randomDifference[Math.floor(Math.random() * randomDifference.length)];     
            diffFound = differences[randomIndex];
            rect = rects[randomSection];            

        } while(
            (diffFound && (randomVector.x < rect.x && randomVector.x > rect.x  + rect.width) &&
                (randomVector.y < rect.y && randomVector.y > rect.y + rect.height))
        );
        
        await this.blinkQuadrant(canvasContext.context, rect);
        this.loadCanvasImages(this.getImageSourceFromBuffer(canvasContext.imageNew? canvasContext.imageNew : canvasContext.original), canvasContext.context);
                    
    }

    async showSecondHint(
        canvasContext : {context: CanvasRenderingContext2D, canvas: ElementRef<HTMLCanvasElement>, imageNew: Buffer, original: Buffer}, 
        game: GameData, differences: boolean[]
    ){
        const width = canvasContext.canvas.nativeElement.width;
        const height = canvasContext.canvas.nativeElement.height;
        const quarterWidth = width / 4;
        const quarterHeight = height / 4;

        const rects = [];

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const quadrant = {
                    x: i * quarterWidth,
                    y: j * quarterHeight,
                    width: quarterWidth,
                    height: quarterHeight,
                };
                canvasContext.context.fillStyle = `rgb(${i * 50}, ${j * 50}, 0)`;
                
                rects.push(quadrant);
              
            }
        }

        let rect;
        let randomIndex = Math.floor(Math.random() * game.differences.length)
        let randomDifference = game.differences[randomIndex];
        let randomVector = randomDifference[Math.floor(Math.random() * randomDifference.length)];     
        let diffFound = differences[randomIndex];
        do {
            let randomSection = Math.floor(Math.random() * 4);
            randomIndex = Math.floor(Math.random() * game.differences.length)
            randomDifference = game.differences[randomIndex];
            randomVector = randomDifference[Math.floor(Math.random() * randomDifference.length)];     
            diffFound = differences[randomIndex];
            rect = rects[randomSection];            

        } while(
            (diffFound && (randomVector.x < rect.x && randomVector.x > rect.x  + rect.width) &&
                (randomVector.y < rect.y && randomVector.y > rect.y + rect.height))
        );

        await this.blinkQuadrant(canvasContext.context, rect);
        this.loadCanvasImages(this.getImageSourceFromBuffer(canvasContext.imageNew? canvasContext.imageNew : canvasContext.original), canvasContext.context);
        
    }

    async blinkQuadrant(context: CanvasRenderingContext2D, rect : {x: number, y: number, width: number, height: number}){
        for (let i = 0; i < NUMBER_OF_BLINKS; i++){
            context.fillStyle = "#FF0000";
            context.fillRect(rect.x as number, 
                rect.y as number, 
                rect.width as number, 
                rect.height as number);
                await this.sleep(QUARTER_SECOND);
            context.fillStyle = "#0000FF";
            context.fillRect(rect.x as number, 
                rect.y as number, 
                rect.width as number, 
                rect.height as number);
                await this.sleep(QUARTER_SECOND);            
        }

    }

    



    async blinkDifference(imageOld: Buffer, imageNew: Buffer, context: CanvasRenderingContext2D) {
        this.loadCanvasImages(this.getImageSourceFromBuffer(imageNew), context);
        for (let i = 0; i < NUMBER_OF_BLINKS; i++) {
            await this.sleep(BLINK_TIME);
            this.loadCanvasImages(this.getImageSourceFromBuffer(imageOld), context);
            await this.sleep(BLINK_TIME);
            this.loadCanvasImages(this.getImageSourceFromBuffer(imageNew), context);
        }
    }

    alternateOldNewImage(oldImage: Buffer, newImage: Buffer, context: CanvasRenderingContext2D) {
        let showOldImage = false;
        const interval = window.setInterval(() => {
            if (showOldImage) {
                this.loadCanvasImages(this.getImageSourceFromBuffer(oldImage), context);
            } else {
                this.loadCanvasImages(this.getImageSourceFromBuffer(newImage), context);
            }
            showOldImage = !showOldImage;
        }, QUARTER_SECOND / 2);
        return interval;
    }

    loadCurrentImage(image: Buffer, context: CanvasRenderingContext2D) {
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
            context.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        };
    }

    getColorIndicesForCoord(x: number, y: number, canvas: HTMLCanvasElement): Uint8ClampedArray {
        const context = canvas.getContext('2d') as CanvasRenderingContext2D;
        const imageData = context.getImageData(x, canvas.height - y, 1, 1) as ImageData;
        const pix = imageData.data;
        return pix as Uint8ClampedArray;
    }

    combineImages(originalBuffer: Buffer, drawingCanvas: HTMLCanvasElement) {
        for (let x = 0; x < drawingCanvas.width; x++) {
            for (let y = 0; y < drawingCanvas.height; y++) {
                const inspectedColor = this.getColorIndicesForCoord(x, y, drawingCanvas);
                if (inspectedColor[3] !== 0) {
                    this.setRGB(new Vector2(x, y), originalBuffer, new Pixel(inspectedColor[0], inspectedColor[1], inspectedColor[2]));
                }
            }
        }
    }

    private getRGB = (position: Vector2, imageBuffer: Buffer): Pixel | null => {
        try {
            const pixelPosition = this.getPixelBufferPosAtPixelPos(position, imageBuffer);
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
        const pixelStart = BMP_FILE_HEADER_BYTES_LENGTH;

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

        return (position.x + yPosition * imageWidth) * PIXEL_BYTES_LENGTH + pixelStart;
    };

    private isImageUsingTopDownFormat = (imageBuffer: Buffer): boolean => {
        const imageHeight = imageBuffer.readInt32LE(IMAGE_HEIGHT_OFFSET);
        return imageHeight < 0;
    };
}
