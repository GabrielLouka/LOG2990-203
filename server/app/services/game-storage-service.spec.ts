/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { R_ONLY } from '@app/utils/env';
import { GameData } from '@common/game-data';
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as fs from 'fs';
import { describe } from 'mocha';
import { MongoClient } from 'mongodb';
import * as sinon from 'sinon';
import { DatabaseServiceMock } from './database.service.mock';
import { GameStorageService } from './game-storage.service';
chai.use(chaiAsPromised);

describe('Game storage service', () => {
    let gameStorageService: GameStorageService;
    let databaseServiceTest: DatabaseServiceMock;
    let client: MongoClient;
    let gamePrototype: GameData;

    beforeEach(async () => {
        databaseServiceTest = new DatabaseServiceMock();
        client = (await databaseServiceTest.start()) as MongoClient;
        gameStorageService = new GameStorageService(databaseServiceTest as any);

        gamePrototype = {
            id: 5,
            name: 'Glouton',
            isEasy: true,
            nbrDifferences: 5,
            differences: [[]],
            ranking: [
                [
                    { name: 'Player 1', score: '10:00' },
                    { name: 'Player 2', score: '10:00' },
                    { name: 'Player 3', score: '10:00' },
                ],
                [
                    { name: 'Player 1', score: '10:00' },
                    { name: 'Player 2', score: '10:00' },
                    { name: 'Player 3', score: '10:00' },
                ],
            ],
        };
        await gameStorageService.collection.insertOne(gamePrototype);
    });
    afterEach(async () => {
        await databaseServiceTest.closeConnection();
    });
    it('should return all the games from the database', async () => {
        const gamesDatabase = await gameStorageService.getAllGames();
        expect(gamesDatabase.length).to.equal(1);
        expect(gamePrototype).to.deep.equals(gamesDatabase[0]);
    });
    it('should return the number of games', async () => {
        const numberOfGames = await gameStorageService.getGamesLength();
        expect(numberOfGames).to.equal(1);
    });
    it('should get specific game with valid id', async () => {
        const id = '5';
        const gameById = await gameStorageService.getGameById(id);
        expect(gameById.gameData).to.deep.equals(gamePrototype);
    });
    it('should get specific game with invalid id', async () => {
        const id = '2';
        const gameById = await gameStorageService.getGameById(id);
        expect(gameById.gameData).to.deep.equals(null);
    });
    it('should delete a game with the specific id ', async () => {
        const id = '5';
        await gameStorageService.deleteGame(id);
        const allGames = await gameStorageService.getAllGames();
        expect(allGames.length).to.equal(0);
    });
    // TODO Property 'acknowledged' does not exist on type 'void'.
    // it('should delete all the games in the database', async () => {
    //     const deletedAllGames = await gameStorageService.deleteAllGames();
    //     expect(deletedAllGames.acknowledged).to.equals(true);
    // });
    it('should get the games in the pages', async () => {
        const gamesPage = await gameStorageService.getGamesInPage(0);
        expect(gamesPage.length).to.equal(1);
    });
    it('should store the game result', async () => {
        gameStorageService.storeGameResult(gamePrototype);
        const allGames = await gameStorageService.getAllGames();
        expect(allGames.length).to.equal(1);
    });
    it('should store defaultGame in the database', async () => {
        await gameStorageService.deleteAllGames();
        await gameStorageService.storeDefaultGames();
        const allGames = await gameStorageService.getAllGames();
        expect(allGames.length).to.equal(1);
    });
    it('should return the next available game id', () => {
        const sandbox: sinon.SinonSandbox = sinon.createSandbox();
        const readFileStub = sandbox.stub(fs, 'readFileSync');
        const writeFileStub = sinon.spy(fs, 'writeFileSync');
        readFileStub.returns('14');
        const result = gameStorageService.getNextAvailableGameId();
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(result).to.equal(15);
        sinon.assert.calledWith(writeFileStub, R_ONLY.persistentDataFolderPath + R_ONLY.lastGameIdFileName, '15');
        sandbox.restore();
        sinon.restore();
    });
    it('should throw an error if the path is not good when return the next available game id', () => {
        const sandbox: sinon.SinonSandbox = sinon.createSandbox();
        const readFileStub = sandbox.stub(fs, 'readFileSync');
        const writeFileStub = sandbox.spy(fs, 'writeFileSync');
        readFileStub.throws(Error);
        const result = gameStorageService.getNextAvailableGameId();
        expect(result).to.equal(0);
        sinon.assert.calledWith(writeFileStub, R_ONLY.persistentDataFolderPath + R_ONLY.lastGameIdFileName, '0');
        sandbox.restore();
        sinon.restore();
    });
    it('should create a new folder', () => {
        const pathTest = './app/data';
        const sandbox: sinon.SinonSandbox = sinon.createSandbox();
        const mkdirStub = sandbox.spy(fs, 'mkdir');
        gameStorageService.createFolder(pathTest);
        sinon.assert.calledWith(mkdirStub, pathTest, { recursive: true });
        sandbox.restore();
        sinon.restore();
    });
    it('should throw an error when creating the folder', () => {
        const sandbox: sinon.SinonSandbox = sinon.createSandbox();
        const pathTest = './app/data';
        const mkdirStub: sinon.SinonStub = sandbox.stub(fs, 'mkdir');
        const consoleStub = sandbox.stub(console, 'error');
        const errorMessage = 'Error: folder already exists';
        mkdirStub.callsFake((path: any, options: any, callback: (arg0: Error) => void) => {
            callback(new Error(errorMessage));
        });
        gameStorageService.createFolder(pathTest);
        sinon.assert.calledWith(mkdirStub, pathTest, { recursive: true });
        sinon.assert.called(consoleStub);
        sandbox.restore();
        sinon.restore();
    });
    it('should store the game images in the folder', () => {
        const sandbox: sinon.SinonSandbox = sinon.createSandbox();
        const writeFileSpy = sandbox.spy(fs, 'writeFile');
        const id = 5;
        const bufferImage1 = Buffer.from([0]);
        const bufferImage2 = Buffer.from([0]);
        gameStorageService.storeGameImages(id, bufferImage1, bufferImage2);
        sinon.assert.calledTwice(writeFileSpy);
        sandbox.restore();
        sinon.restore();
    });
    it('should show the error if any error appear in the writing', () => {
        const myError = new Error('error in the writing');
        const sandbox: sinon.SinonSandbox = sinon.createSandbox();
        const consoleStub = sandbox.stub(console, 'error');
        gameStorageService.writeFileErrorManagement(myError);
        sinon.assert.called(consoleStub);
        sandbox.restore();
        sinon.restore();
    });
    describe('Error Handling', async () => {
        it('should throw an error if we try to get all the games  on a closed connection', async () => {
            await client.close();
            expect(gameStorageService.getAllGames()).to.eventually.be.rejectedWith(Error);
        });
        it('should throw an error if we try to get a specific game on a closed connection', async () => {
            await client.close();
            expect(gameStorageService.getGameById('5')).to.eventually.be.rejectedWith(Error);
        });
    });
});
