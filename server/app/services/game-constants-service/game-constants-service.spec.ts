/* eslint-disable @typescript-eslint/no-magic-numbers */
import { expect } from 'chai';
import { GameConstantsService } from './game-constant.service';

describe('GameConstantsService', () => {
    const gameConstantsService = new GameConstantsService();

    describe('getConstants', () => {
        it('should return game constants', () => {
            const initConstants = { countdownValue: 45, penaltyValue: 5, bonusValue: 5 };
            let theConstants = gameConstantsService.updateConstants(initConstants);
            theConstants = gameConstantsService.getConstants();
            expect(theConstants).to.equal(initConstants);
        });
    });
});
