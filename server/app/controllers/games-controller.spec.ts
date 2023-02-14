/* eslint-disable @typescript-eslint/no-explicit-any */
import { Application } from '@app/app';
import { GameStorageService } from '@app/services/game-storage.service';
import { EntireGameUploadForm } from '@common/entire.game.upload.form';
import { GameData } from '@common/game-data';
import { Vector2 } from '@common/vector2';
import { assert, expect } from 'chai';
import { StatusCodes } from 'http-status-codes';
import * as sinon from 'sinon';
import { createSandbox, createStubInstance, SinonSandbox, SinonStubbedInstance } from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';
// import { GamesController } from './games.controller';

const HTTP_STATUS_NOT_FOUND = StatusCodes.NOT_FOUND;
const HTTP_STATUS_OK = StatusCodes.OK;
const HTTP_STATUS_CREATED = StatusCodes.CREATED;
// const HTTP_STATUS_BAD_REQUEST = StatusCodes.BAD_REQUEST;
const API_URL = '/api/games';

describe('GamesController', () => {
    let gameStorageServiceStub: SinonStubbedInstance<GameStorageService>;
    // let gamesController: GamesController;
    let sandbox: SinonSandbox;
    let expressApp: Express.Application;
    beforeEach(async () => {
        sandbox = createSandbox();
        gameStorageServiceStub = createStubInstance(GameStorageService);
        // gamesController = new GamesController(gameStorageServiceStub);

        const app = Container.get(Application);
        expressApp = app.app;
    });

    afterEach(() => {
        sinon.reset();
        sandbox.restore();
    });

    const game: GameData = {
        id: 0,
        name: 'Glutton',
        isEasy: true,
        nbrDifferences: 7,
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        differences: [[new Vector2(1, 2), new Vector2(5, 6)], [new Vector2(4, 3)]], // array of all the pixels in a difference
        ranking: [[]],
    };
    const images = { originalImage: Buffer.from(''), modifiedImage: Buffer.from('') };
    const gameInfo = {
        gameData: game as any,
        originalImage: images.originalImage,
        isEasy: true,
    };
    describe('GET /fetchGame/:id', () => {
        it('GET should return game by id', async () => {
            gameStorageServiceStub.getGameById.returns(
                Promise.resolve({ gameData: game, originalImage: images.originalImage, modifiedImage: images.modifiedImage }),
            );

            supertest(expressApp)
                .get(`${API_URL}/fetchGame/0`)
                .expect(HTTP_STATUS_OK)
                .then((response) => {
                    expect(response.body).to.deep.equal(game);
                });
        });
        it('fetchGame should catch error', async () => {
            const errorMessage = 'Update failed';
            gameStorageServiceStub.getGameById.returns(Promise.reject(new Error(errorMessage)));

            supertest(expressApp)
                .get(`${API_URL}/fetchGame/${game.id}`)
                .expect(HTTP_STATUS_OK)
                .end((err, res) => {
                    if (err) return err;
                    expect(res.body).to.deep.equal(game);
                });
        });
    });
    describe('GET /:id', () => {
        it('GET should return games by page id', async () => {
            gameStorageServiceStub.getGamesInPage.returns(Promise.resolve([{ gameData: gameInfo.gameData, originalImage: gameInfo.originalImage }]));
            gameStorageServiceStub.getGamesLength.returns(Promise.resolve(1));
            supertest(expressApp)
                .get(`${API_URL}/fetchGame/0`)
                .expect(HTTP_STATUS_OK)
                .then((response) => {
                    assert(response.body);
                    assert.deepEqual(response.status, HTTP_STATUS_OK);
                    expect(response.body).to.deep.equal(game);
                });
        });

        it('GET should not return games by page id if cannot get games', async () => {
            const errorMessage = 'Update failed';
            gameStorageServiceStub.getGamesInPage.returns(Promise.reject(new Error(errorMessage)));
            gameStorageServiceStub.getGamesLength.returns(Promise.resolve(1));
            supertest(expressApp)
                .get(`${API_URL}/fetchGame/0`)
                .expect(HTTP_STATUS_OK)
                .then((response) => {
                    expect(response.text).to.equal(errorMessage);
                });
        });

        it('GET should call two gameStorageService methods ', async () => {
            const gamesInPageSpy = sinon.spy(GameStorageService.prototype, 'getGamesInPage');
            const getGamesLengthSpy = sinon.spy(GameStorageService.prototype, 'getGamesLength');

            supertest(expressApp)
                .get(`${API_URL}/fetchGame/0`)
                .expect(HTTP_STATUS_OK)
                .then(() => {
                    assert(gamesInPageSpy.calledOnce);
                    assert(getGamesLengthSpy.calledOnce);
                });
            gamesInPageSpy.restore();
            getGamesLengthSpy.restore();
            sinon.restore();
        });

        it('GET should not return games by page id if cannot get games length', async () => {
            const errorMessage = 'Update failed';
            gameStorageServiceStub.getGamesInPage.returns(Promise.resolve([{ gameData: gameInfo.gameData, originalImage: gameInfo.originalImage }]));
            gameStorageServiceStub.getGamesLength.returns(Promise.reject(new Error(errorMessage)));
        });
    });

    describe('POST /saveGame ', () => {
        it('POST /saveGame should save a new game ', async () => {
            const storeImagesSpy = sinon.spy(GameStorageService.prototype, 'storeGameImages');
            const storeGameResultSpy = sinon.spy(GameStorageService.prototype, 'storeGameResult');
            const newGameToAdd: EntireGameUploadForm = {
                gameId: 2,
                firstImage: { background: [], foreground: [] },
                secondImage: { background: [], foreground: [] },
                differences: [[{ x: 100, y: 100 }]],
                gameName: 'saveGame test',
                isEasy: true,
            };
            const buffer1 = Buffer.from(newGameToAdd.firstImage.background);
            const buffer2 = Buffer.from(newGameToAdd.secondImage.background);
            supertest(expressApp)
                .post(`${API_URL}/saveGame`)
                .send(newGameToAdd)
                .expect(HTTP_STATUS_CREATED)
                .then((response) => {
                    expect(response.body).to.deep.equal({ body: newGameToAdd.gameName });
                    assert(storeImagesSpy.calledOnce);
                    assert(storeGameResultSpy.calledOnce);
                    assert(storeImagesSpy.calledWith(newGameToAdd.gameId, buffer1, buffer2));
                });
            storeImagesSpy.restore();
            storeGameResultSpy.restore();
            sinon.restore();
        });
        it('POST /saveGame should not save a new game when error occurs ', async () => {
            const storeImagesSpy = sinon.spy(GameStorageService.prototype, 'storeGameImages');
            const storeGameResultSpy = sinon.spy(GameStorageService.prototype, 'storeGameResult');
            const errorMessage = 'Store game images failed';
            gameStorageServiceStub.storeGameResult.returns(Promise.reject(new Error(errorMessage)));

            supertest(expressApp)
                .post(`${API_URL}/saveGame`)
                .send(game)
                .expect(HTTP_STATUS_NOT_FOUND)
                .then((response) => {
                    expect(response.text).to.equal(errorMessage);
                });
            storeImagesSpy.restore();
            storeGameResultSpy.restore();
            sinon.restore();
        });
    });
    describe('DELETE /deleteAllGames', () => {
        it('DELETE request should delete all games from database', async () => {
            supertest(expressApp)
                .delete(`${API_URL}/deleteAllGames`)
                .expect(HTTP_STATUS_OK)
                .then((response) => {
                    expect(response.text).to.equal(0);
                    expect(response.status).to.equal(HTTP_STATUS_OK);
                });
        });
        it('DELETE /deleteAllGames should not delete when error occurs', async () => {
            const errorMessage = 'Update failed';
            gameStorageServiceStub.deleteAllGames.returns(Promise.reject(new Error(errorMessage)));
            supertest(expressApp)
                .delete(`${API_URL}/deleteAllGames`)
                .expect(HTTP_STATUS_NOT_FOUND)
                .then((response) => {
                    expect(response.text).to.equal(errorMessage);
                });
        });
    });
});
