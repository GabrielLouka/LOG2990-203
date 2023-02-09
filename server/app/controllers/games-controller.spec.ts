/* eslint-disable @typescript-eslint/no-magic-numbers */
// eslint-disable-next-line @typescript-eslint/quotes
import { Vector2 } from '@common/vector2';
import { expect } from 'chai';
import * as supertest from 'supertest';
// import * as http from 'http';
import { Application } from '@app/app';
import { GameStorageService } from '@app/services/game-storage.service';
import { GameData } from '@common/game-data';
import { StatusCodes } from 'http-status-codes';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { Container } from 'typedi';

const HTTP_STATUS_OK = StatusCodes.OK;
// const HTTP_STATUS_NOT_FOUND = StatusCodes.NOT_FOUND;
// const API_URL = '/api/games';

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
    const images = { originalImage: '', modifiedImage: '' };
    let gameStorageService: SinonStubbedInstance<GameStorageService>;
    let expressApp: Express.Application;

    beforeEach(async () => {
        gameStorageService = createStubInstance(GameStorageService);
        gameStorageService.getGameImages.resolves(images);
        gameStorageService.deleteGame.resolves(true);
        gameStorageService.getAllGames.resolves(games);
        const app = Container.get(Application);
        // eslint-disable-next-line dot-notation
        Object.defineProperty(app['gamesController'], 'gameStorageService', { value: gameStorageService });
        expressApp = app.app;
    });

    it('should return all games', async () => {
        return supertest(expressApp)
            .get('/api/games')
            .expect(302)
            .then((response) => {
                expect(response.body).to.deep.equal({});
            });
    });

    // it('should return message from example service on valid get request to about route', async () => {
    //     const aboutMessage = { ...baseMessage, title: 'About' };
    //     exampleService.about.returns(aboutMessage);
    //     return supertest(expressApp)
    //         .get('/api/example/about')
    //         .expect(HTTP_STATUS_OK)
    //         .then((response) => {
    //             expect(response.body).to.deep.equal(aboutMessage);
    //         });
    // });

    // it('should store message in the array on valid post request to /send', async () => {
    //     const message: Message = { title: 'Hello', body: 'World' };
    //     return supertest(expressApp).post('/api/example/send').send(message).set('Accept', 'application/json').expect(HTTP_STATUS_CREATED);
    // });

    // it('should return an array of messages on valid get request to /all', async () => {
    //     exampleService.getAllMessages.returns([baseMessage, baseMessage]);
    //     return supertest(expressApp)
    //         .get('/api/example/all')
    //         .expect(HTTP_STATUS_OK)
    //         .then((response) => {
    //             expect(response.body).to.deep.equal([baseMessage, baseMessage]);
    //         });
    // });
    // let service: GamesController;
    // // let service: SinonStubbedInstance<GameStorageService>;
    // let expressApp: Express.Application;
    // // let httpServer: http.Server;

    // beforeEach(async () => {
    //     const serverContainer = Container.get(Server);
    //     serverContainer.init();
    //     // httpServer = serverContainer['server'];
    // });

    // it('get request on initial page should return all games from database', async () => {
    //     await service.gameStorageService.getAllGames();
    //     return req(expressApp)
    //         .get('/api/games/')
    //         .expect(200)
    //         .then((response) => {
    //             expect(response.body).to.be.deep.equal({});
    //         });
    // });

    // it('get query should handle error and send status code on error', async () => {
    //     try {
    //         await gameController.gameStorageService.getAllGames();
    //     } catch (e) {
    //         expect(e.message).to.equal(HTTP_STATUS_NOT_FOUND);
    //     }
    // });

    // it('delete request on initial page should return delete all games from database', async () => {
    //     try {
    //         await gameController.gameStorageService.deleteAllGames();
    //     } catch (e) {
    //         expect(e.message).to.equal(HTTP_STATUS_NOT_FOUND);
    //     }
    //     return req(expressApp).delete('/api/games/deleteAllGames').expect(HTTP_STATUS_OK);
    // });

    // it('get request to /fetchGame/:id should return a game', async () => {
    //     const game = games[0];
    //     await gameController.gameStorageService.deleteAllGames();
    //     await gameController.gameStorageService.storeGameResult(game.id, game.differences, game.isEasy);
    //     gameController.gameStorageService.updateGameName(game.id, game.name);
    //     const response = await req(expressApp).get(`${API_URL}/fetchGame/0`);
    //     expect(response.status).to.equal(HTTP_STATUS_OK);
    //     expect(response.body).to.be.deep.equal(game);
    //     console.log(response.body.toString());
    // });

    // it("get request with id should return game with matching id from database", async () => {
    //     const queryId = "1";
    //     // const gameQuery = { id: parseInt(queryId, 10) };
    //     const correctGame = await gameController.gamesService.getGameById(queryId);
    //     return req(expressApp)
    //         .get(`/:${queryId}`)
    //         .then((response) => {
    //             expect(response.body).to.be.deep.equal(correctGame);
    //         });

    // });
});
