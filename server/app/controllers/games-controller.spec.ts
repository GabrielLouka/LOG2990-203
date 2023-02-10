/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
// eslint-disable-next-line @typescript-eslint/quotes
import { Vector2 } from '@common/vector2';
import { assert, expect } from 'chai';
import * as sinon from 'sinon';
import * as supertest from 'supertest';
// import * as http from 'http';
import { Application } from '@app/app';
import { GameStorageService } from '@app/services/game-storage.service';
import { GameData } from '@common/game-data';
import { Buffer } from 'buffer';
import { StatusCodes } from 'http-status-codes';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { Container } from 'typedi';
import { GamesController } from './games.controller';

const HTTP_STATUS_OK = StatusCodes.OK;
const HTTP_STATUS_NOT_FOUND = StatusCodes.NOT_FOUND;
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

    // const stubGameValues = {
    //     id: faker.random.numeric(),
    //     name: faker.word.noun(),
    //     isEasy: true,
    //     nbrDifferences: faker.random.numeric(),
    //     differences: [[new Vector2(1, 2), new Vector2(5, 6)], [new Vector2(4, 3)]],
    //     ranking: [[]],
    // };
    const images = { originalImage: Buffer.from(''), modifiedImage: Buffer.from('') };
    const gameInfo = {
        gameData: games[0],
        originalImage: images.originalImage,
        modifiedImage: images.modifiedImage,
    };
    let gameStorageService: SinonStubbedInstance<GameStorageService>;
    let expressApp: Express.Application;

    beforeEach(async () => {
        gameStorageService = createStubInstance(GameStorageService);
        gameStorageService.getGameImages.resolves(images);
        gameStorageService.getAllGames.resolves(games);
        gameStorageService.getGamesLength.resolves(1);
        const app = Container.get(Application);
        // eslint-disable-next-line dot-notation
        expressApp = app.app;
    });

    it('should be defined', async () => {
        const gameController: GamesController = new GamesController(gameStorageService);
        assert(gameController);
        assert(gameController.router);
    });

    it('should return all games', async () => {
        supertest(expressApp)
            .get(`${API_URL}/0`)
            .expect(HTTP_STATUS_OK)
            .then((response) => {
                assert(response.body);
                expect(response.body).to.deep.equal({});
            });
    });

    it('GET should return game by id', async () => {
        gameStorageService.getGameById.resolves({
            gameData: games[0],
            originalImage: images.originalImage,
            modifiedImage: images.modifiedImage,
        });
        supertest(expressApp)
            .get(`${API_URL}/fetchGame/0`)
            .expect(HTTP_STATUS_OK)
            .expect({})
            .then((response) => {
                assert(response.body);
                expect(response.text).to.deep.equal(JSON.stringify(gameInfo));
                expect(response.body).to.contain('originalImage').to.equal('');
                expect(response.body).to.contain('name').to.equal('Glutton');
                expect(response.body).to.contain('id').to.equal(0);
            });
    });

    it('GET should not return game if gameLength not been correctly saved', async () => {
        gameStorageService.getGamesLength.throwsException();
        supertest(expressApp)
            .get(`${API_URL}/fetchGame/0`)
            .expect(HTTP_STATUS_NOT_FOUND)
            .catch((err) => {
                assert(err.message);
            });
    });

    it('GET not should return game by id when ERROR catch', async () => {
        gameStorageService.getGameById.throwsException();
        supertest(expressApp)
            .get(`${API_URL}/fetchGame/0`)
            .expect(HTTP_STATUS_NOT_FOUND)
            .catch((err) => {
                assert(err.message);
            });
    });

    it('GET should return games per pageId', async () => {
        gameStorageService.getGamesInPage.resolves([]);
        const queryId = '89';
        supertest(expressApp)
            .get(`${API_URL}/${queryId}`)
            .expect(HTTP_STATUS_NOT_FOUND)
            .then((response) => {
                assert(response.body);
                assert(response.clientError);
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
    });

    it('POST /saveGame should save a new game ', async () => {
        supertest(expressApp)
            .post(`${API_URL}/saveGame`)
            .send(games[0])
            .expect(HTTP_STATUS_OK)
            .end((_err, res) => {
                expect(res.status).to.equal(HTTP_STATUS_OK);
                expect(res.body).to.contain('id').to.equal(0);
            });
    });

    it('POST should update game name ', async () => {
        const updatedName = games[3].name;
        const spy = sinon.spy(gameStorageService, 'updateGameName');
        await gameStorageService.updateGameName(games[0].id, updatedName);
        supertest(expressApp)
            .post(`${API_URL}/updateName`)
            .send([games[0].id, updatedName])
            .expect(HTTP_STATUS_OK)
            .then((res) => {
                assert(res.status);
                expect(res.body).to.deep.equal({});
            });
        expect(spy.called);
        supertest(expressApp)
            .get(`${API_URL}/fetchGame/0`)
            .expect(HTTP_STATUS_OK)
            .then((res) => {
                console.log(res);
                assert(res.body);
                assert(res.text);
                assert(res.status);
                expect(res.body).to.deep.equal({});
            });
    });

    it('POST should not update game name when ERROR catch ', async () => {
        gameStorageService.updateGameName.throwsException();
        supertest(expressApp)
            .post(`${API_URL}/updateName`)
            .send([games[0].id, games[0].name])
            .expect(HTTP_STATUS_OK)
            .catch((response) => {
                assert(response.message);
                assert(response.status === HTTP_STATUS_NOT_FOUND);
            });
    });

    it('DELETE request should delete all games from database', async () => {
        supertest(expressApp)
            .delete(`${API_URL}/deleteAllGames`)
            .expect(HTTP_STATUS_OK)
            .then((response) => {
                assert(response.statusCode === HTTP_STATUS_OK);
                assert(response.accepted);
            });
    });

    it('DELETE request should not delete when ERROR catch', async () => {
        gameStorageService.deleteAllGames.throwsException();
        supertest(expressApp)
            .delete(`${API_URL}/deleteAllGames`)
            .expect(HTTP_STATUS_NOT_FOUND)
            .catch((err) => {
                assert(err.message === true);
            });
    });
});
