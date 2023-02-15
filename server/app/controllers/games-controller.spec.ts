/* eslint-disable @typescript-eslint/no-explicit-any */
import { Application } from '@app/app';
import { GameStorageService } from '@app/services/game-storage.service';
import { EntireGameUploadForm } from '@common/entire.game.upload.form';
import { GameData } from '@common/game-data';
import { Vector2 } from '@common/vector2';
import { expect } from 'chai';
import { StatusCodes } from 'http-status-codes';
import * as sinon from 'sinon';
import { createSandbox, createStubInstance, SinonSandbox, SinonStubbedInstance } from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';

const HTTP_STATUS_NOT_FOUND = StatusCodes.NOT_FOUND;
const HTTP_STATUS_OK = StatusCodes.OK;
const HTTP_STATUS_CREATED = StatusCodes.CREATED;

const API_URL = '/api/games';

describe('GamesController', () => {
    let gameStorageServiceStub: SinonStubbedInstance<GameStorageService>;
    let sandbox: SinonSandbox;
    let expressApp: Express.Application;
    beforeEach(async () => {
        sandbox = createSandbox();
        gameStorageServiceStub = createStubInstance(GameStorageService);

        const app = Container.get(Application);
        Object.defineProperty(app['gamesController'], 'gameStorageService', { value: gameStorageServiceStub });
        expressApp = app.app;
    });

    afterEach(() => {
        sinon.restore();
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
            gameStorageServiceStub.getGameById.rejects(errorMessage);

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
                .get(`${API_URL}/0`)
                .expect(HTTP_STATUS_OK)
                .then((response) => {
                    expect(response.body).to.deep.equal({
                        gameContent: [{ gameData: gameInfo.gameData, originalImage: gameInfo.originalImage }],
                        nbrOfGames: 1,
                    });
                });
        });

        it('GET should not return games by page id if cannot get games', async () => {
            const errorMessage = 'Update failed';
            gameStorageServiceStub.getGamesInPage.rejects(errorMessage);
            gameStorageServiceStub.getGamesLength.returns(Promise.resolve(1));
            supertest(expressApp)
                .get(`${API_URL}/0`)
                .expect(HTTP_STATUS_OK)
                .then((response) => {
                    expect(response.text).to.equal(errorMessage);
                });
        });
    });
    describe('POST /saveGame ', () => {
        it('POST /saveGame should save a new game ', async () => {
            gameStorageServiceStub.storeGameImages.resolves();
            gameStorageServiceStub.storeGameResult.resolves();
            const newGameToAdd: EntireGameUploadForm = {
                gameId: 2,
                firstImage: { background: [], foreground: [] },
                secondImage: { background: [], foreground: [] },
                differences: [[{ x: 100, y: 100 }]],
                gameName: 'saveGame test',
                isEasy: true,
            };
            await supertest(expressApp)
                .post(`${API_URL}/saveGame`)
                .send(newGameToAdd)
                .expect(HTTP_STATUS_CREATED)
                .then((response) => {
                    expect(response.body).to.deep.equal({ body: newGameToAdd.gameName });
                });
            sinon.restore();
        });

        it('POST /saveGame should not save a new game when error occurs ', async () => {
            const errorMessage = 'Store game result failed';
            gameStorageServiceStub.storeGameImages.resolves();
            gameStorageServiceStub.storeGameResult.rejects(errorMessage);
            const newGameToAdd: EntireGameUploadForm = {
                gameId: 2,
                firstImage: { background: [], foreground: [] },
                secondImage: { background: [], foreground: [] },
                differences: [[{ x: 100, y: 100 }]],
                gameName: 'saveGame test',
                isEasy: true,
            };
            await supertest(expressApp)
                .post(`${API_URL}/saveGame`)
                .send(newGameToAdd)
                .expect(HTTP_STATUS_NOT_FOUND)
                .then((response) => {
                    expect(response.text).to.equal('');
                });
            sinon.restore();
        });
    });
    describe('DELETE /deleteAllGames', async () => {
        it('DELETE request should delete all games from database', async () => {
            gameStorageServiceStub.deleteAllGames.resolves();
            await supertest(expressApp)
                .delete(`${API_URL}/deleteAllGames`)
                .expect(HTTP_STATUS_OK)
                .then((response) => {
                    expect(response.body).to.deep.equal({});
                });
        });
        it('DELETE /deleteAllGames should not delete when error occurs', async () => {
            const errorMessage = 'Update failed';
            gameStorageServiceStub.deleteAllGames.rejects(errorMessage);
            supertest(expressApp)
                .delete(`${API_URL}/deleteAllGames`)
                .expect(HTTP_STATUS_NOT_FOUND)
                .then((response) => {
                    expect(response.text).to.equal(errorMessage);
                });
        });
    });
});
