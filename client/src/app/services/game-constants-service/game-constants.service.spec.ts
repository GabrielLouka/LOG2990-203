/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TestBed } from '@angular/core/testing';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { GameConstantsService } from './game-constants.service';

describe('GameConstantsService', () => {
    let service: GameConstantsService;
    let mockCommunicationService: jasmine.SpyObj<CommunicationService>;

    beforeEach(() => {
        mockCommunicationService = jasmine.createSpyObj(['get', 'post']);
        TestBed.configureTestingModule({
            providers: [GameConstantsService, { provide: CommunicationService, useValue: mockCommunicationService }],
        });
        service = TestBed.inject(GameConstantsService);
    });

    it('should return the countdown value', () => {
        expect(service.countdownValue).toEqual(0);
    });

    it('should return the penalty value', () => {
        expect(service.penaltyValue).toEqual(0);
    });

    it('should return the bonus value', () => {
        expect(service.bonusValue).toEqual(0);
    });

    it('should update constants', () => {
        service.updateConstants(true);
        expect(service.countdownValue).toEqual(45);
        expect(service.penaltyValue).toEqual(5);
        expect(service.bonusValue).toEqual(5);
        expect(mockCommunicationService.post).toHaveBeenCalledWith(service.constants, '/game_constants/');
        mockCommunicationService.post.calls.reset();

        service.updateConstants(false);
        expect(mockCommunicationService.post).toHaveBeenCalledWith(service.constants, '/game_constants/');
    });
});
