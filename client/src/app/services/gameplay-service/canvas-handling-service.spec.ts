// import { TestBed } from '@angular/core/testing';

// import { HttpClientTestingModule } from '@angular/common/http/testing';
// import { ElementRef } from '@angular/core';
// import { ImageManipulationService } from '../image-manipulation-service/image-manipulation.service';
// import { CanvasHandlingService } from './canvas-handling.service';

// describe('HintService', () => {
//   let canvasService: CanvasHandlingService;
//   let imageManipulationService: jasmine.SpyObj<ImageManipulationService>;
//   let elementRefSpy: jasmine.SpyObj<ElementRef>;
//   const MockElementRef: ElementRef = {
//     nativeElement : {}
//   }

//   beforeEach(() => {
//     const spyImageManipulationService = jasmine.createSpyObj('ImageManipulationService', ['loadCanvasImages']);
//     imageManipulationService = spyImageManipulationService as jasmine.SpyObj<ImageManipulationService>;
//     elementRefSpy = TestBed.inject(ElementRef) as jasmine.SpyObj<ElementRef>;

//     TestBed.configureTestingModule({
//         imports: [HttpClientTestingModule],
//         providers: [
//             canvasService,
//             { provide: ElementRef, useValue: MockElementRef }
//           ]
//         });
//         canvasService = TestBed.inject(CanvasHandlingService);
//         canvasService.cheat = elementRefSpy;
//   });

//   it('should be created', () => {
//     expect(canvasService).toBeTruthy();
//   });

//   it('should update the canvas with new images', async () => {
//     const originalImage = Buffer.alloc(100, 0);
//     const modifiedImage = Buffer.alloc(100, 0);

//     spyOn(canvasService, 'loadImagesToCanvas');
//     spyOn(imageManipulationService, 'getImageSourceFromBuffer').and.callThrough();

//     await canvasService.updateCanvas(originalImage, modifiedImage);

//     expect(canvasService.loadImagesToCanvas).toHaveBeenCalledWith(jasmine.any(String), jasmine.any(String));
//     expect(imageManipulationService.getImageSourceFromBuffer).toHaveBeenCalledTimes(2);
//     expect(canvasService.originalImage).toBe(originalImage);
//     expect(canvasService.modifiedImage).toBe(modifiedImage);
//   });

//   it('should load images into canvas context', async () => {
//     const imgSource1 = 'data:image/png;base64,iVBORw0KGg....';
//     const imgSource2 = 'data:image/png;base64,iVBORw0KGg....';

//     spyOn(imageManipulationService, 'loadCanvasImages').and.callThrough();

//     await canvasService.loadImagesToCanvas(imgSource1, imgSource2);

//     expect(imageManipulationService.loadCanvasImages).toHaveBeenCalledTimes(2);

//   });

//   it('should refresh the modified image without differences', async () => {
//     const gameData = {} as any;
//     const foundDifferences = [true, false, false];
//     const originalImage = Buffer.alloc(100, 0);
//     const modifiedImage = Buffer.alloc(100, 0);
//     const newImage = Buffer.alloc(100, 0);

//     spyOn(imageManipulationService, 'getModifiedImageWithoutDifferences').and.returnValue(newImage);
//     spyOn(imageManipulationService, 'blinkDifference').and.callThrough();

//     await canvasService.updateCanvas(originalImage, modifiedImage);
//     await canvasService.refreshModifiedImage(gameData, foundDifferences);

//     expect(imageManipulationService.getModifiedImageWithoutDifferences).toHaveBeenCalledWith(
//       gameData,
//       { originalImage, modifiedImage },
//       foundDifferences,
//     );

//     expect(canvasService.currentModifiedImage).toBe(newImage);
//   });


// });
