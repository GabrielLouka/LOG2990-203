import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ImageManipulationService } from '../image-manipulation-service/image-manipulation.service';

import { CheatModeService } from './cheat-mode.service';

describe('CheatModeService', () => {
    let service: CheatModeService;
    let imageManipulationServiceSpy: jasmine.SpyObj<ImageManipulationService>;

    beforeEach(() => {
        const spy = jasmine.createSpyObj('ImageManipulationService', ['alternateOldNewImage', 'loadCurrentImage']);
        TestBed.configureTestingModule({
            providers: [
                CheatModeService, { provide: ImageManipulationService, useValue: spy}
            ]
        });
        service = TestBed.inject(CheatModeService);
        imageManipulationServiceSpy = TestBed.inject(ImageManipulationService) as jasmine.SpyObj<ImageManipulationService>;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it("focusKeyEvent should call focus() on the native element", () => {
        let cheat: ElementRef = new ElementRef({focus() {}});
        const focusSpy = spyOn(cheat.nativeElement, 'focus');
        service.focusKeyEvent(cheat);
        expect(focusSpy).toHaveBeenCalled();
    });

    it("putCanvasIntoInitialState should call loadCurrentImage from the imageManipulationService", () => {
        const originalBuffer: Buffer = Buffer.alloc(100, 1);
        const modifiedBuffer: Buffer = Buffer.alloc(100, 0);
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        service.putCanvasIntoInitialState(
            {originalImage: originalBuffer, currentModifiedImage: modifiedBuffer},
            {leftContext: context  as CanvasRenderingContext2D, rightContext: context as CanvasRenderingContext2D}            
        );
        expect(imageManipulationServiceSpy.loadCurrentImage).toHaveBeenCalled();

    });

    it("stopCheating should call clearInterval", () => {
        const windowSpy = spyOn(window, 'clearInterval');
        const interval = 2;
        service.stopCheating(interval, interval);
        expect(windowSpy).toHaveBeenCalledTimes(2);
    });

    it("startInterval should call alternateOldNewImage", () => {
        const originalBuffer: Buffer = Buffer.alloc(100, 1);
        const modifiedBuffer: Buffer = Buffer.alloc(100, 0);
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        service.startInterval({originalImage: originalBuffer, newImage: modifiedBuffer}, context as CanvasRenderingContext2D);
        expect(imageManipulationServiceSpy.alternateOldNewImage).toHaveBeenCalled();
    });

});
