import { TestBed } from '@angular/core/testing';

import { ElementRef } from '@angular/core';
import { GameData } from '@common/interfaces/game-data';
import { Buffer } from 'buffer';
import { ImageManipulationService } from '../image-manipulation-service/image-manipulation.service';
import { CanvasHandlingService } from './canvas-handling.service';

describe('HintService', () => {
  let service: CanvasHandlingService;
  // let leftCanvas: ElementRef<HTMLCanvasElement>;
  // let rightCanvas: ElementRef<HTMLCanvasElement>;
  let imageManipulationServiceSpy: jasmine.SpyObj<ImageManipulationService>;
  // const mockElementRef: ElementRef<any> = {
  //   nativeElement: document.createElement('canvas')
  // };

  beforeEach(() => {
    // leftCanvas = new ElementRef(document.createElement('canvas'));
    // rightCanvas = new ElementRef(document.createElement('canvas'));
    const spy = jasmine.createSpyObj('ImageManipulationService', 
      ['getImageSourceFromBuffer', 
      'loadCanvasImages', 
      'getModifiedImageWithoutDifferences', 
      'blinkDifference',
      'alternateOldNewImage'
    ]);

    
    TestBed.configureTestingModule({
      providers: [
        CanvasHandlingService,
        { provide: ImageManipulationService, useValue: spy },
        {
          provide: ElementRef,
          useValue: {
            nativeElement: document.createElement('canvas')
          }
        }
      ]
    });
    service = TestBed.inject(CanvasHandlingService);
    imageManipulationServiceSpy = TestBed.inject(ImageManipulationService) as jasmine.SpyObj<ImageManipulationService>;

  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it("startDelayedMethod should call alternateOldNewImage", () => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const image = Buffer.alloc(100, 0);
    const imageOld = Buffer.alloc(100, 0);
    service.startDelayedMethod({originalImage: image, newImage: imageOld}, context as CanvasRenderingContext2D);
    expect(imageManipulationServiceSpy.alternateOldNewImage).toHaveBeenCalled();

  });

  it("loadImagesToCanvas should call loadCanvasImages", () => {
    service.loadImagesToCanvas("source 1", "source 2");
    expect(imageManipulationServiceSpy.loadCanvasImages).toHaveBeenCalledTimes(2);
  });

  it("refreshModifiedImage should call getModifiedImageWithoutDifferences and blinkDifference", () => {
    const gameData: GameData = {
      id: 1,
      name: 'Find the Differences',
      isEasy: true,
      nbrDifferences: 5,
      differences: [],
      oneVersusOneRanking: [],
      soloRanking: []
    };
    const foundDifferences: boolean[] = [];

    service.refreshModifiedImage(gameData, foundDifferences);
    expect(imageManipulationServiceSpy.getModifiedImageWithoutDifferences).toHaveBeenCalled(); 

  });




});
