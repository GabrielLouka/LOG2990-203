/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
// eslint-disable-next-line @typescript-eslint/quotes
import * as supertest from 'supertest';
// import * as http from 'http';
import { Application } from '@app/app';
import { GameStorageService } from '@app/services/game-storage.service';
import { GameData } from '@common/game-data';
import { Vector2 } from '@common/vector2';
import { assert } from 'chai';
import { StatusCodes } from 'http-status-codes';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { Container } from 'typedi';
import sinon = require('sinon');

const HTTP_STATUS_OK = StatusCodes.OK;
const HTTP_STATUS_CREATED = StatusCodes.CREATED;
const HTTP_STATUS_NOT_FOUND = StatusCodes.NOT_FOUND;
const HTTP_STATUS_BAD_REQUEST = StatusCodes.BAD_REQUEST;
const API_URL = '/api/games';

describe('GameController', () => {
    const games: GameData[] = [
        {
            id: 0,
            name: 'Glutton',
            isEasy: true,
            nbrDifferences: 7,
            differences: [[new Vector2(1, 2), new Vector2(5, 6)], [new Vector2(4, 3)]], // array of all the pixels in a difference
            ranking: [[]],
        },

        {
            id: 1,
            name: 'Monster',
            isEasy: false,
            nbrDifferences: 4,
            differences: [[new Vector2(1, 2), new Vector2(5, 6)], [new Vector2(4, 3)]], // array of all the pixels in a difference
            ranking: [[]],
        },

        {
            id: 2,
            name: 'Cooking and Creme',
            isEasy: true,
            nbrDifferences: 3,
            differences: [[new Vector2(1, 2), new Vector2(5, 6)], [new Vector2(4, 3)]], // array of all the pixels in a difference
            ranking: [[]],
        },

        {
            id: 3,
            name: 'Apple or Bananas',
            isEasy: true,
            nbrDifferences: 6,
            differences: [[new Vector2(1, 2), new Vector2(5, 6)], [new Vector2(4, 3)]], // array of all the pixels in a difference
            ranking: [[]],
        },
    ];

    const images = { originalImage: Buffer.from(''), modifiedImage: Buffer.from('') };
    const gameInfo = {
        gameData: games[0],
        originalImage: images.originalImage,
        modifiedImage: images.modifiedImage,
    };
    const gameInfo2 = {
        gameData: games[1],
        originalImage: images.originalImage,
        modifiedImage: images.modifiedImage,
    };
    let gameStorageService: SinonStubbedInstance<GameStorageService>;
    let expressApp: Express.Application;

    beforeEach(async () => {
        gameStorageService = createStubInstance(GameStorageService);
        const app = Container.get(Application);
        // eslint-disable-next-line dot-notation
        Object.defineProperty(app['gamesController'], 'gameStorageService', { value: gameStorageService });
        expressApp = app.app;
    });

    it('should return all games', async () => {
        await gameStorageService.deleteAllGames();
        gameStorageService.getGamesInPage.resolves([gameInfo, gameInfo2]);
        gameStorageService.getGamesLength.resolves(2);

        supertest(expressApp)
            .get(`${API_URL}/0`)
            .expect(HTTP_STATUS_OK)
            .then((response) => {
                const gameContentExpected = [gameInfo, gameInfo2];
                const gameLengthExpected = 2;
                const gameInformation = { gameContent: gameContentExpected, nbrOfGames: gameLengthExpected };
                assert.deepEqual(response.text, JSON.stringify(gameInformation));
                assert.deepEqual(response.status, HTTP_STATUS_OK);
            });
        sinon.reset();
    });

    it('GET should return game by id', async () => {
        gameStorageService.getGameById.returns(Promise.resolve(gameInfo));
        return supertest(expressApp)
            .get(`${API_URL}/fetchGame/0`)
            .expect(HTTP_STATUS_OK)
            .then((response) => {
                assert.deepEqual(response.text, JSON.stringify(gameInfo));
            });
    });

    it('GET should not return game if gameLength not been correctly saved', async () => {
        gameStorageService.getGamesLength.throwsException();
        return supertest(expressApp)
            .get(`${API_URL}/fetchGame/0`)
            .expect(HTTP_STATUS_NOT_FOUND)
            .catch((err) => {
                assert(err.message);
            });
    });

    it('GET not should return game by id when ERROR catch', async () => {
        gameStorageService.getGameById.throwsException();
        return supertest(expressApp)
            .get(`${API_URL}/fetchGame/0`)
            .expect(HTTP_STATUS_NOT_FOUND)
            .catch((err) => {
                assert(err.message);
            });
    });

    it('GET should not return games per pageId when no game on pageId', async () => {
        gameStorageService.getGamesInPage.resolves([]);
        const queryId = '89';
        return supertest(expressApp)
            .get(`${API_URL}/${queryId}`)
            .expect(HTTP_STATUS_BAD_REQUEST)
            .then((response) => {
                assert(response.error);
            });
    });

    it('GET should not return games per pageId when ERROR', async () => {
        gameStorageService.getGamesInPage.throwsException();
        const queryId = '0';
        supertest(expressApp)
            .get(`${API_URL}/${queryId}`)
            .expect(HTTP_STATUS_NOT_FOUND)
            .catch((err) => {
                assert(err.message);
            });
        sinon.restore();
    });

    it('POST /saveGame should save a new game ', async () => {
        const storeImagesSpy = sinon.spy(GameStorageService.prototype, 'storeGameImages');
        const storeGameResultSpy = sinon.spy(GameStorageService.prototype, 'storeGameResult');
        const updateNameSpy = sinon.spy(GameStorageService.prototype, 'updateGameName');
        supertest(expressApp)
            .post(`${API_URL}/saveGame`)
            .send(games[0])
            .expect(HTTP_STATUS_OK)
            .then((res) => {
                assert(storeImagesSpy.calledOnce);
                assert(storeGameResultSpy.calledOnce);
                assert(updateNameSpy.calledOnce);
                assert.deepEqual(res.status, HTTP_STATUS_CREATED);
            });
        sinon.restore();
    });

    it('POST /saveGame should not save new game when ERROR ', async () => {
        gameStorageService.storeGameImages.throwsException();
        supertest(expressApp)
            .post(`${API_URL}/saveGame`)
            .send(games[0])
            .expect(HTTP_STATUS_NOT_FOUND)
            .catch((error) => {
                assert(error.message);
            });
        sinon.restore();
    });

    it('POST should update game name ', async () => {
        const spy = sinon.spy(GameStorageService.prototype, 'updateGameName');
        const updatedName = games[3].name;
        supertest(expressApp)
            .post(`${API_URL}/updateName`)
            .send([games[0].id, updatedName])
            .expect(HTTP_STATUS_CREATED)
            .then((res) => {
                assert(spy.called);
                assert(res.status);
                assert.deepEqual(res.body, updatedName);
            });
        sinon.restore();
    });

    it('POST should not update game name when ERROR catch ', async () => {
        gameStorageService.updateGameName.throwsException();
        supertest(expressApp)
            .post(`${API_URL}/updateName`)
            .send([games[0].id, games[0].name])
            .expect(HTTP_STATUS_OK)
            .catch((response) => {
                assert(response.message);
                assert.deepEqual(response.status, HTTP_STATUS_NOT_FOUND);
            });
        sinon.restore();
    });

    it('DELETE request should delete all games from database', async () => {
        supertest(expressApp)
            .delete(`${API_URL}/deleteAllGames`)
            .expect(HTTP_STATUS_OK)
            .then((response) => {
                assert.deepEqual(response.status, HTTP_STATUS_OK);
                assert.deepEqual(response.body, 0);
            });
    });

    it('DELETE request should not delete when ERROR catch', async () => {
        gameStorageService.deleteAllGames.throwsException();
        supertest(expressApp)
            .delete(`${API_URL}/deleteAllGames`)
            .expect(HTTP_STATUS_NOT_FOUND)
            .catch((err) => {
                assert(err.message);
            });
    });
});
