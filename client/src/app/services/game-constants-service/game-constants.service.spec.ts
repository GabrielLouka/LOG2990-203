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

    it('should reset constants', () => {
        service.updateConstants(true);
        expect(service.countdownValue).toEqual(45);
        expect(service.penaltyValue).toEqual(5);
        expect(service.bonusValue).toEqual(5);
    });

    it('should not reset constants', () => {
        service.constants.countdownValue = 45;
        service.constants.penaltyValue = 5;
        service.constants.bonusValue = 5;
        service.updateConstants(false);
        expect(service.countdownValue).toEqual(45);
        expect(service.penaltyValue).toEqual(5);
        expect(service.bonusValue).toEqual(5);
    });
});
