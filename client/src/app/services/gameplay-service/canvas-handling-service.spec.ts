/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TestBed } from '@angular/core/testing';

import { ElementRef } from '@angular/core';
import { DelayedMethod } from '@app/classes/delayed-method/delayed-method';
import { ImageManipulationService } from '@app/services/image-manipulation-service/image-manipulation.service';
import { GameData } from '@common/interfaces/game-data';
import { Buffer } from 'buffer';
import { CanvasHandlingService } from './canvas-handling.service';

describe('HintService', () => {
    let service: CanvasHandlingService;
    // let leftCanvas: ElementRef<HTMLCanvasElement>;
    // let rightCanvas: ElementRef<HTMLCanvasElement>;
    let imageManipulationServiceSpy: jasmine.SpyObj<ImageManipulationService>;
    // const mockElementRef: ElementRef<any> = {
    //   nativeElement: document.createElement('canvas')
    // };
    let delayedMethod: jasmine.SpyObj<DelayedMethod>;

    beforeEach(() => {
        // leftCanvas = new ElementRef(document.createElement('canvas'));
        // rightCanvas = new ElementRef(document.createElement('canvas'));
        const spy = jasmine.createSpyObj('ImageManipulationService', [
            'getImageSourceFromBuffer',
            'loadCanvasImages',
            'getModifiedImageWithoutDifferences',
            'blinkDifference',
            'alternateOldNewImage',
            'loadCurrentImage',
        ]);
        delayedMethod = jasmine.createSpyObj('DelayedMethod', ['stop', 'resume', 'pause']);

        TestBed.configureTestingModule({
            providers: [
                CanvasHandlingService,
                { provide: ImageManipulationService, useValue: spy },
                { provide: DelayedMethod, useValue: delayedMethod },
                {
                    provide: ElementRef,
                    useValue: {
                        nativeElement: document.createElement('canvas'),
                    },
                },
            ],
        });
        service = TestBed.inject(CanvasHandlingService);
        imageManipulationServiceSpy = TestBed.inject(ImageManipulationService) as jasmine.SpyObj<ImageManipulationService>;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('startDelayedMethod should call alternateOldNewImage', () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const image = Buffer.alloc(100, 0);
        const imageOld = Buffer.alloc(100, 0);
        service.startDelayedMethod({ originalImage: image, newImage: imageOld }, context as CanvasRenderingContext2D);
        expect(imageManipulationServiceSpy.alternateOldNewImage).toHaveBeenCalled();
    });

    it('loadImagesToCanvas should call loadCanvasImages', () => {
        service.loadImagesToCanvas('source 1', 'source 2');
        expect(imageManipulationServiceSpy.loadCanvasImages).toHaveBeenCalledTimes(2);
    });

    it('refreshModifiedImage should call getModifiedImageWithoutDifferences and blinkDifference', () => {
        const gameData: GameData = {
            id: 1,
            name: 'Find the Differences',
            isEasy: true,
            nbrDifferences: 5,
            differences: [],
            oneVersusOneRanking: [],
            soloRanking: [],
        };
        const foundDifferences: boolean[] = [];

        service.refreshModifiedImage(gameData, foundDifferences);
        expect(imageManipulationServiceSpy.getModifiedImageWithoutDifferences).toHaveBeenCalled();
    });

    it('refreshModifiedImage should call getModifiedImageWithoutDifferences and blinkDifference', () => {
        service.currentModifiedImage = Buffer.alloc(0);
        const gameData: GameData = {
            id: 1,
            name: 'Find the Differences',
            isEasy: true,
            nbrDifferences: 5,
            differences: [],
            oneVersusOneRanking: [],
            soloRanking: [],
        };
        const foundDifferences: boolean[] = [];

        service.refreshModifiedImage(gameData, foundDifferences);
        expect(imageManipulationServiceSpy.getModifiedImageWithoutDifferences).toHaveBeenCalled();
    });

    it('initialize cheat mode', () => {
        const gameData: GameData = {
            id: 1,
            name: 'Find the Differences',
            isEasy: true,
            nbrDifferences: 5,
            differences: [],
            oneVersusOneRanking: [],
            soloRanking: [],
        };
        const foundDifferences: boolean[] = [];
        const image = Buffer.alloc(100, 0);
        const imageOld = Buffer.alloc(100, 0);
        // const delayedMethod = new DelayedMethod(() => {}, 1, false);
        service.blinkDelayedMethodRight = delayedMethod;
        // spyOn(service, 'startDelayedMethod').and.callFake((() => {
        //     service.blinkDelayedMethodRight = delayedMethod;
        // }) as any);
        spyOn(delayedMethod, 'start' as any).and.callFake(() => {
            return;
        });
        spyOn(delayedMethod, 'start' as any).and.callFake(() => {
            return;
        });

        service.isCheating = true;
        service.initializeCheatMode(gameData, { originalImage: image, modifiedImage: imageOld }, foundDifferences);

        expect(imageManipulationServiceSpy.getModifiedImageWithoutDifferences).toHaveBeenCalled();
        // expect(startSpy).toHaveBeenCalled();
        expect(service.isCheating).toBeFalsy();
    });

    it('putCanvasIntoInitialState should call loadCurrentImage', () => {
        const image = Buffer.alloc(100, 0);
        const imageOld = Buffer.alloc(100, 0);
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        service.putCanvasIntoInitialState(
            { originalImage: image, currentModifiedImage: imageOld },
            { leftContext: context as CanvasRenderingContext2D, rightContext: context as CanvasRenderingContext2D },
        );
        expect(imageManipulationServiceSpy.loadCurrentImage).toHaveBeenCalledTimes(2);
    });

    it('stop cheating should delay', () => {
        service.blinkDelayedMethodLeft = new DelayedMethod(() => {}, 1, false);
        service.blinkDelayedMethodRight = new DelayedMethod(() => {}, 1, false);
        spyOn<any>(service.blinkDelayedMethodLeft, 'stop');
        spyOn<any>(service.blinkDelayedMethodRight, 'stop');
        service.stopCheating();
        expect(service.blinkDelayedMethodLeft.stop).toHaveBeenCalled();
        expect(service.blinkDelayedMethodRight.stop).toHaveBeenCalled();
    });
});
