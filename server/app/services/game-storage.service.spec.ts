/* eslint-disable prettier/prettier */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable prettier/prettier */
import { GameData } from '@common/game-data';
import { Vector2 } from '@common/vector2';
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';
import { MongoClient } from 'mongodb';
import { DatabaseServiceMock } from './database.service.mock';
import { GameStorageService } from './game-storage.service';
chai.use(chaiAsPromised); // this allows us to test for rejection
describe('GameStorageService', () => {
  let gameStorageService:GameStorageService;
  let databaseService:DatabaseServiceMock;
  let client : MongoClient ;
  beforeEach(async()=>{
    databaseService=new DatabaseServiceMock();
    gameStorageService=new GameStorageService(databaseService as any);
    client=(await databaseService.start()) as MongoClient;
    const game:GameData={
        id: 1,
        name: 'Glutton',
        isEasy: true,
        nbrDifferences: 7,
        differences: [[new Vector2(1,2),new Vector2(5,6)],[new Vector2(4,3)]], // array of all the pixels in a difference
        ranking: [[]],
        };
        const game1:GameData={
        id: 2,
        name: 'naruto',
        isEasy: true,
        nbrDifferences: 7,
        differences: [[new Vector2(1,2),new Vector2(5,6)],[new Vector2(4,3)]], // array of all the pixels in a difference
        ranking: [[]],
    };
    await gameStorageService.collection.insertMany([game,game1]);
        
  });
  afterEach(async()=>{
    databaseService.closeConnection();
  });
  it('should return all games', async () => {
    const allGames = await gameStorageService.getAllGames();
    expect(allGames.length).to.equal(2);
  });
  it('should return the gameLength', async () => {
    const allGames = await gameStorageService.getGamesLength();
    expect(allGames).to.equal(2);
  });
  describe('Error Handling', async()=>{
    it('should throw an error if we try to get all games on a closed connection', async () => {
        await client.close();
        expect(gameStorageService.getAllGames()).to.eventually.be.rejectedWith(
          Error
        );
      });
  
  });

});
