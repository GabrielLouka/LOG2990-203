import { expect } from "chai";
import { MongoClient, OptionalId } from "mongodb";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { DatabaseService } from "./database.service";
import Sinon = require("sinon");

describe("Database service", () => {
    let databaseService: DatabaseService;
    let mongoServer: MongoMemoryServer;
  
    beforeEach(async () => {
      databaseService = new DatabaseService();
      mongoServer = await MongoMemoryServer.create();
    });
  
    afterEach(async () => {
      // if (databaseService["client"]) {
      //   await databaseService["client"]!.close();
      // }
    }); 
  
    it("should connect to the database when start is called", async () => {
      const mongoUri = mongoServer.getUri();
      await databaseService.start(mongoUri);
      expect(databaseService["client"]).to.not.be.undefined;
      expect(databaseService["db"].databaseName).to.equal("LOG2990");
    });
  
    it("should not connect to the database when start is called with wrong URL", async () => {
      // try{
      //   await databaseService.start("wrong uri");;
      //   fail();
      // }  
      // catch {
      //   expect(databaseService['client']).to.equal(undefined);
      // }
      const startSpy = Sinon.spy(databaseService, "start");
      expect(startSpy).to.throw('Database connection error');
      
    });

    it("populateDb should add data to database", async() => {
      const game = {
        id: 1,
        name: "name",
        isEasy: true,
        nbrDifferences: 1,
        differences: [[{x:0, y:0}]],
        ranking: [[{
          name: "name",
          score: "score"
        }]]
      } as unknown as OptionalId<Document>;

      const uri = mongoServer.getUri();
      const client = new MongoClient(uri);
      await client.connect();

      databaseService['db'] = client.db("LOG2990");

      let theGames = await databaseService.database.collection("games").find({}).toArray();
      expect(theGames.length).to.deep.equal(0);

      await databaseService.populateDb("games", [game]);
      if(theGames.length === 0) theGames = await databaseService.database.collection("games").find({}).toArray();
      else expect(theGames.length).to.deep.equal(1);

      await databaseService.populateDb("games", [game]);
      expect(await (await databaseService.database.collection("games").find({}).toArray()).length).to.equal(1);
      
      await databaseService.closeConnection();
      
      
    });

    

  
    
  });
  