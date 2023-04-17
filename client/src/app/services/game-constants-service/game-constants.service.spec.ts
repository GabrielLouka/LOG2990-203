/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { GameConstantsService } from './game-constants.service';

describe('GameConstantsService', () => {
    let service: GameConstantsService;
    let mockCommunicationService: jasmine.SpyObj<CommunicationService>;

    beforeEach(() => {
        mockCommunicationService = jasmine.createSpyObj('CommunicationService', ['post']);
        service = new GameConstantsService(mockCommunicationService);
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
});
