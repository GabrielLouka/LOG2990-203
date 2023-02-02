import { Application } from "@app/app";
import { GamesService } from "@app/services/games.service";
import { expect } from "chai";
import { StatusCodes } from 'http-status-codes';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import Container from "typedi";
import { GamesController } from "./games.controller";
import supertest = require("supertest");


// const HTTP_STATUS_OK = StatusCodes.OK;
const HTTP_SATUS_NOT_FOUND = StatusCodes.NOT_FOUND;

describe("GameController", () => {
    let gameController: GamesController;    
    let gameService: SinonStubbedInstance<GamesService>;
    let expressApp: Express.Application;

    beforeEach(async() => {
        gameService = createStubInstance(GamesService);
        gameController = new GamesController(gameService);
        const app = Container.get(Application);
        expressApp = app.app;
    });

    it("get request on initial page should return all games from databse", async () => {        
        await gameController.gamesService.getAllGames();
        return supertest(expressApp)
            .get("/")
            .expect(302)
            .then((response) => {
                expect(response.body).to.be.deep.equal({})
            });
    });

    it("get query should handle error and send status code on error", async () => {        
        try{
            await gameController.gamesService.getAllGames();
            
        } catch (e){
            expect(e.message).to.equal(HTTP_SATUS_NOT_FOUND);
        }
    });

    // it("get request with id should return game with matching id from database", async () => {        
    //     const queryId = "1";
    //     // const gameQuery = { id: parseInt(queryId, 10) };
    //     const correctGame = await gameController.gamesService.getGameById(queryId);
    //     return supertest(expressApp)
    //         .get(`/:${queryId}`)
    //         .then((response) => {
    //             expect(response.body).to.be.deep.equal(correctGame);
    //         });
        
    // });
});