/* eslint-disable prettier/prettier */
// import { GameData } from '@common/game-data';
// import { Vector2 } from '@common/vector2';
// import { expect } from 'chai';
// import { MongoMemoryServer } from 'mongodb-memory-server';
// import { DatabaseService } from './database.service';
// import { GameStorageService } from './game-storage.service';

// describe('GameStorageService', () => {
//   let gameStorageService:GameStorageService;
//   let databaseService:DatabaseService;
//   let mongoServer: MongoMemoryServer;
//   let uri= '';
//   const collectionName='games';
//   const game:GameData={
//     id: 1,
//     name: 'Glutton',
//     isEasy: true,
//     nbrDifferences: 7,
//     differences: [[new Vector2(1,2),new Vector2(5,6)],[new Vector2(4,3)]], // array of all the pixels in a difference
//     ranking: [[]],
//   };
//   beforeEach(async()=>{
//     gameStorageService=new GameStorageService(databaseService);
//     databaseService=new DatabaseService();
//     mongoServer=await MongoMemoryServer.create();
//     uri=mongoServer.getUri();
//     await databaseService.start(uri);
//     await databaseService.database.collection(collectionName).insertOne(game);
//   });
//   afterEach(async()=>{
//     databaseService.closeConnection();
//     mongoServer.stop();
//   });
//   it('getAllGames should return all games', async () => {
//     const allGames = await gameStorageService.getAllGames();
//     expect(allGames.length).to.equal(1);
//   });

// });
