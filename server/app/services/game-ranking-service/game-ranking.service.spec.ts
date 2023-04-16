/* eslint-disable no-restricted-imports */
import { defaultRanking } from '@common/interfaces/ranking';
import { RankingData } from '@common/interfaces/ranking.data';
import { expect } from 'chai';
import { stub } from 'sinon';
import { DatabaseService } from '../database-service/database.service';
import { GameStorageService } from '../game-storage-service/game-storage.service';
import { GameRankingService } from './game-ranking.service';

describe('GameRankingService', () => {
    let gameRankingService: GameRankingService;
    let gameStorageService: GameStorageService;

    beforeEach(() => {
        gameStorageService = new GameStorageService(new DatabaseService());
        gameRankingService = new GameRankingService(gameStorageService);
        gameRankingService['newRanking'] = { name: 'testName', score: 1, gameName: 'testGame' };
        gameRankingService['gameName'] = 'testGame';
        gameRankingService['matchType'] = '1 contre 1';
    });

    it('should return the updated ranking data', async () => {
        stub(gameStorageService, 'getGameById').resolves({
            gameData: {
                id: 1,
                name: 'Test',
                isEasy: false,
                nbrDifferences: 4,
                differences: [
                    [
                        { x: 4, y: 0 },
                        { x: 3, y: 0 },
                        { x: 2, y: 0 },
                        { x: 1, y: 0 },
                        { x: 0, y: 0 },
                    ],
                ],
                soloRanking: defaultRanking,
                oneVersusOneRanking: defaultRanking,
            },
            originalImage: Buffer.from(''),
            modifiedImage: Buffer.from(''),
        });
        const gameId = 'game-id';
        const isOneVersusOne = true;
        const ranking = { name: 'player1', score: 100, gameName: 'game1' };
        const expectedRankingData: RankingData = {
            username: 'player1',
            position: 'deuxième',
            gameName: 'game1',
            matchType: '1 contre 1',
        };
        stub(gameStorageService, 'updateGameOneVersusOneNewBreakingRecord').resolves(1);
        stub(gameStorageService, 'updateGameSoloNewBreakingRecord').resolves(1);
        const actualRankingData = await gameRankingService.handleNewScore(gameId, isOneVersusOne, ranking);

        expect(actualRankingData).to.deep.equal(expectedRankingData);
    });

    it('should return the updated ranking data for a one versus one game', async () => {
        stub(gameStorageService, 'getGameById').resolves({
            gameData: {
                id: 1,
                name: 'Test',
                isEasy: false,
                nbrDifferences: 4,
                differences: [
                    [
                        { x: 4, y: 0 },
                        { x: 3, y: 0 },
                        { x: 2, y: 0 },
                        { x: 1, y: 0 },
                        { x: 0, y: 0 },
                    ],
                ],
                soloRanking: defaultRanking,
                oneVersusOneRanking: defaultRanking,
            },
            originalImage: Buffer.from(''),
            modifiedImage: Buffer.from(''),
        });
        gameRankingService['newRanking'] = { name: 'testName', score: 1, gameName: 'testGame' };
        stub(gameStorageService, 'updateGameOneVersusOneNewBreakingRecord').resolves(1);
        stub(gameStorageService, 'updateGameSoloNewBreakingRecord').resolves(1);

        const expectedRankingData: RankingData = {
            username: gameRankingService['newRanking'].name,
            position: 'deuxième',
            gameName: gameRankingService['newRanking'].gameName,
            matchType: gameRankingService['matchType'],
        };

        const actualRankingData = await gameRankingService.updateRanking('gameId', true);
        expect(actualRankingData).to.deep.equal(expectedRankingData);
    });

    it('should return the updated ranking data for a solo game', async () => {
        stub(gameStorageService, 'getGameById').resolves({
            gameData: {
                id: 1,
                name: 'Test',
                isEasy: false,
                nbrDifferences: 4,
                differences: [
                    [
                        { x: 4, y: 0 },
                        { x: 3, y: 0 },
                        { x: 2, y: 0 },
                        { x: 1, y: 0 },
                        { x: 0, y: 0 },
                    ],
                ],
                soloRanking: defaultRanking,
                oneVersusOneRanking: defaultRanking,
            },
            originalImage: Buffer.from(''),
            modifiedImage: Buffer.from(''),
        });
        gameRankingService['newRanking'] = { name: 'testName', score: 1, gameName: 'testGame' };
        stub(gameStorageService, 'updateGameSoloNewBreakingRecord').resolves(1);
        gameRankingService['matchType'] = 'Solo';
        const expectedRankingData: RankingData = {
            username: gameRankingService['newRanking'].name,
            position: 'deuxième',
            gameName: gameRankingService['newRanking'].gameName,
            matchType: gameRankingService['matchType'],
        };

        const actualRankingData = await gameRankingService.updateRanking('gameId', false);
        expect(actualRankingData).to.deep.equal(expectedRankingData);
    });

    it('should set position to "première" for input 1', () => {
        gameRankingService['positionToString'](1);
        expect(gameRankingService['position']).to.equal('première');
    });

    it('should set position to "deuxième" for input 2', () => {
        gameRankingService['positionToString'](2);
        expect(gameRankingService['position']).to.equal('deuxième');
    });

    it('should set position to "troisième" for input 3', () => {
        gameRankingService['positionToString'](3);
        expect(gameRankingService['position']).to.equal('troisième');
    });

    it('should set position to "" for default', () => {
        gameRankingService['positionToString'](0);
        expect(gameRankingService['position']).to.equal('');
    });
});
