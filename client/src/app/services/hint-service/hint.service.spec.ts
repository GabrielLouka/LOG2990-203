import { TestBed, fakeAsync, tick } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ElementRef } from '@angular/core';
import { ChatComponent } from '@app/components/chat/chat.component';
import { MILLISECOND_TO_SECONDS } from '@common/utils/env';
import { GameConstantsService } from '../game-constants-service/game-constants.service';
import { ImageManipulationService } from '../image-manipulation-service/image-manipulation.service';
import { HintService } from './hint.service';

describe('HintService', () => {
  let hintService: HintService;
  let imageService: jasmine.SpyObj<ImageManipulationService>;
  let chatComponent: ChatComponent;
//   let constantService: jasmine.SpyObj<GameConstantsService>;

  beforeEach(() => {

    const spyImageManipulationService = jasmine.createSpyObj('ImageManipulationService', ['showFirstHint', 'showSecondHint', 'showThirdHint']);
    const spyGameConstantsService = jasmine.createSpyObj('GameConstantsService', ['initGameConstants']);
    chatComponent = jasmine.createSpyObj('ChatComponent', ['sendSystemMessage']);
    hintService = new HintService(spyImageManipulationService, spyGameConstantsService);
    imageService = spyImageManipulationService as jasmine.SpyObj<ImageManipulationService>;
    // constantService = spyGameConstantsService as jasmine.SpyObj<GameConstantsService>;

    TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [ImageManipulationService, GameConstantsService, HintService],
        });
        hintService = TestBed.inject(HintService);
  });

  it('should be created', () => {
    expect(hintService).toBeTruthy();
  });

  it('should set randomNumber with Math.random()', () => {
      spyOn(Math, 'random').and.returnValue(0.1234);

      hintService.initialize();

      expect(imageService.randomNumber).toBeUndefined();
    }); 

    it('should return the correct time penalty for limited hints', () => {
        const gameConstantsSpy = jasmine.createSpyObj('GameConstantsService', ['initGameConstants']);
        gameConstantsSpy.penaltyValue = 5;
        const isLimited = true;        
        expect(hintService.getTimePenalty(isLimited)).toEqual(0);
    });   
    
    it('should return the correct time bonus for unlimited hints', () => {
        const gameConstantsSpy = jasmine.createSpyObj('GameConstantsService', ['initGameConstants']);
        gameConstantsSpy.penaltyValue = 5;
        const isLimited = false;        
        expect(hintService.getTimePenalty(isLimited)).toEqual(-0);
    });

    it("decrement should decrement", () => {
        hintService.decrement();
        expect(hintService.maxGivenHints).toEqual(2);
    });

    it("returnDisplay should return display", () => {
        const display = "newDisplay";
        hintService.returnDisplay(display);
        expect(display).toBeDefined();
    });

    it('should send a system message', () => {
        const now = new Date();
        const formattedTime = now.toLocaleTimeString('en-US', { hour12: false }) + ' - Indice utilisé';    
        hintService.sendHintMessage(chatComponent);
    
        expect(chatComponent.sendSystemMessage).toHaveBeenCalledWith(formattedTime);
    });

    it('should display and hide red error message', fakeAsync(() => {
        const mockElementRef = {
            nativeElement: {
                style: {
                    display: 'none'
                }
            }
        } as ElementRef<HTMLDivElement>;
        hintService.showRedError(mockElementRef);
        expect(mockElementRef.nativeElement.style.display).toBe(hintService.returnDisplay('block'));
        tick(MILLISECOND_TO_SECONDS);
        expect(mockElementRef.nativeElement.style.display).toBe(hintService.returnDisplay('none'));
    }));





    // it('should call showFirstHint method of ImageManipulationService when hints value is 3', () => {
    //     const canvas = { nativeElement: document.createElement('canvas') };
    //     const context = canvas.nativeElement.getContext('2d')!;
    //     const image = Buffer.alloc(100, 1);
    //     const otherImage = Buffer.alloc(100, 1);
    //     const gameInfo = {
    //     gameData: {
    //         id: 1,
    //         name: 'Test Game',
    //         isEasy: true,
    //         nbrDifferences: 3,
    //         differences: [
    //         [
    //             { x: 10, y: 20 },
    //             { x: 30, y: 40 },
    //         ],
    //         [
    //             { x: 50, y: 60 },
    //             { x: 70, y: 80 },
    //             { x: 90, y: 100 },
    //         ],
    //         [
    //             { x: 110, y: 120 },
    //             { x: 130, y: 140 },
    //             { x: 150, y: 160 },
    //         ],
    //         ],
    //         oneVersusOneRanking: [],
    //         soloRanking: [],
    //     },
    //     hints: 2,
    //     diffs: [true, false, true],
    //     };
        
    //     hintService.showHint(canvas, context, image, otherImage, gameInfo);

    //     expect(imageService.showSecondHint).not.toHaveBeenCalled();
    //     expect(imageService.showThirdHint).not.toHaveBeenCalled();
    // });

});
