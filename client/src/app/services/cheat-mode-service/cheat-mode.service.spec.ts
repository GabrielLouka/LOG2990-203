/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TestBed } from '@angular/core/testing';
import { ImageManipulationService } from '@app/services/image-manipulation-service/image-manipulation.service';
import { Buffer } from 'buffer';

import { ElementRef } from '@angular/core';
import { CheatModeService } from './cheat-mode.service';

describe('CheatModeService', () => {
    let service: CheatModeService;
    let imageManipulationServiceSpy: jasmine.SpyObj<ImageManipulationService>;
    let leftCanvasContext: CanvasRenderingContext2D;
    let rightCanvasContext: CanvasRenderingContext2D;

    beforeEach(() => {
        const spy = jasmine.createSpyObj('ImageManipulationService', ['alternateOldNewImage', 'loadCurrentImage']);
        TestBed.configureTestingModule({
            providers: 
            [CheatModeService, 
                { provide: ImageManipulationService, useValue: spy },
                { provide: CanvasRenderingContext2D, useValue: leftCanvasContext },
                { provide: CanvasRenderingContext2D, useValue: rightCanvasContext }
            ],
        });
        service = TestBed.inject(CheatModeService);
        imageManipulationServiceSpy = TestBed.inject(ImageManipulationService) as jasmine.SpyObj<ImageManipulationService>;
        leftCanvasContext = TestBed.inject(CanvasRenderingContext2D);
        rightCanvasContext = TestBed.inject(CanvasRenderingContext2D);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('focusKeyEvent should call focus() on the native element', () => {
        const cheat: ElementRef = new ElementRef({ focus() {} });
        const focusSpy = spyOn(cheat.nativeElement, 'focus');
        service.focusKeyEvent(cheat);
        expect(focusSpy).toHaveBeenCalled();
    });

    it('putCanvasIntoInitialState should call loadCurrentImage from the imageManipulationService', () => {
        const originalBuffer: Buffer = Buffer.alloc(100, 1);
        const modifiedBuffer: Buffer = Buffer.alloc(100, 0);
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        service.putCanvasIntoInitialState(
            { originalImage: originalBuffer, currentModifiedImage: modifiedBuffer },
            { leftContext: context as CanvasRenderingContext2D, rightContext: context as CanvasRenderingContext2D },
        );
        expect(imageManipulationServiceSpy.loadCurrentImage).toHaveBeenCalled();
    });

    // it('stopCheating should call clearInterval', () => {
    //     const windowSpy = spyOn(window, 'clearInterval');
    //     service.stopCheating();
    //     expect(windowSpy).toHaveBeenCalledTimes(2);
    // });

    // it('startInterval should call alternateOldNewImage', () => {
    //     const originalBuffer: Buffer = Buffer.alloc(100, 1);
    //     const modifiedBuffer: Buffer = Buffer.alloc(100, 0);
    //     const canvas = document.createElement('canvas');
    //     const context = canvas.getContext('2d');

    //     service.startInterval({ originalImage: originalBuffer, newImage: modifiedBuffer }, context as CanvasRenderingContext2D);
    //     expect(imageManipulationServiceSpy.alternateOldNewImage).toHaveBeenCalled();
    // });
});
