import { TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { GameConstantsService } from '../game-constants-service/game-constants.service';
import { ImageManipulationService } from '../image-manipulation-service/image-manipulation.service';
import { HintService } from './hint.service';

describe('HintService', () => {
  let hintService: HintService;
  let imageService: jasmine.SpyObj<ImageManipulationService>;
//   let constantService: jasmine.SpyObj<GameConstantsService>;

  beforeEach(() => {

    const spyImageManipulationService = jasmine.createSpyObj('ImageManipulationService', ['showFirstHint', 'showSecondHint', 'showThirdHint']);
    const spyGameConstantsService = jasmine.createSpyObj('GameConstantsService', ['initGameConstants']);

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

});
