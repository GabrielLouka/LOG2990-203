/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { TestBed } from '@angular/core/testing';
import { GameData } from '@common/game-data';
import { Vector2 } from '@common/vector2';
import { Buffer } from 'buffer';

import { ImageManipulationService } from './image-manipulation.service';

describe('ImageManipulationService', () => {
    let service: ImageManipulationService;

    // We have no dependencies to other classes or Angular Components
    // but we can still let Angular handle the objet creation
    beforeEach(() => TestBed.configureTestingModule({}));

    // This runs before each test so we put variables we reuse here
    beforeEach(() => {
        service = TestBed.inject(ImageManipulationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should change the canvas source when loading an image', () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        const src = 'assets/img/image_empty.png';

        service.loadCanvasImages(src, ctx);

        expect(canvas.toDataURL()).not.toBe('');
    });

    it('should get the modified image without the specified differences', () => {
        const originalImage1: Buffer = Buffer.alloc(100, 1);
        const modifiedImage1: Buffer = Buffer.alloc(100, 0);
        const image = { originalImage: originalImage1, modifiedImage: modifiedImage1 };
        const foundDifferences: boolean[] = [true];
        const gameData = { differences: [[new Vector2(0, 0)]] };

        const output = service.getModifiedImageWithoutDifferences(gameData as GameData, image, foundDifferences);

        expect(output).not.toBe(modifiedImage1);
    });

    it('should handle corrupted images', () => {
        const corruptedOgImage: Buffer = Buffer.alloc(1, 1);
        const corruptedModifiedImage: Buffer = Buffer.alloc(0);
        const goodModifiedImage: Buffer = Buffer.alloc(100, 0);
        const goodOgImage: Buffer = Buffer.alloc(100, 1);
        const image1 = { originalImage: corruptedOgImage, modifiedImage: goodModifiedImage };
        const image2 = { originalImage: goodOgImage, modifiedImage: corruptedModifiedImage };

        const foundDifferences: boolean[] = [true];
        const gameData = { differences: [[new Vector2(0, 0)]] };

        const output1 = service.getModifiedImageWithoutDifferences(gameData as GameData, image1, foundDifferences);
        const output2 = service.getModifiedImageWithoutDifferences(gameData as GameData, image2, foundDifferences);

        expect(output1).toEqual(goodModifiedImage);
        expect(output2).toEqual(corruptedModifiedImage);
    });

    it('should blink the difference between two images', () => {
        const imageOld: Buffer = Buffer.alloc(100, 1);
        const imageNew: Buffer = Buffer.alloc(100, 0);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        spyOn(service, 'sleep').and.resolveTo();
        service.blinkDifference(imageOld, imageNew, ctx).then(() => {
            expect(service.sleep).toHaveBeenCalled();
        });
    });
    
});
