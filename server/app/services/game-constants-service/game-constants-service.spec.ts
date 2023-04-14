import { expect } from 'chai';
import { GameConstantsService } from './game-constant.service';

describe('GameConstantsService', () => {
    const gameConstantsService = new GameConstantsService();

    describe('getConstants', () => {
        it('should return game constants', () => {
            let theConstants = gameConstantsService.updateConstants(null);
            theConstants = gameConstantsService.getConstants();
            expect(theConstants).to.equal(null);
        });
    });
});

