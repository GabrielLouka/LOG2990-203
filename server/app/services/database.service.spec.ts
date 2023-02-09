import { fail } from "assert";
import { expect } from "chai";
import { MongoClient } from "mongodb";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { DatabaseService } from "./database.service";

describe("Database service", () => {
    let databaseService: DatabaseService;
    let mongoServer: MongoMemoryServer;
  
    beforeEach(async () => {
      databaseService = new DatabaseService();
      mongoServer = await MongoMemoryServer.create();
    });
  
    afterEach(async () => {
      if (databaseService["client"]) {
        await databaseService["client"].close();
      }
    }); 
  
    it("should connect to the database when start is called", async () => {
      const mongoUri = mongoServer.getUri();
      await databaseService.start(mongoUri);
      expect(databaseService["client"]).to.not.be.undefined;
      expect(databaseService["db"].databaseName).to.equal("LOG2990");
    });
  
    it("should not connect to the database when start is called with wrong URL", async () => {
      try {
        await databaseService.start("WRONG URL");
        fail();
      } catch {
        expect(databaseService["client"]).to.be.undefined;
      }
    });
  
    it("should populate the database with a helper function", async () => {
      const mongoUri = mongoServer.getUri();
      const client = new MongoClient(mongoUri);
      await client.connect();
      databaseService["db"] = client.db("database");
      await databaseService['populateDb'];
      let courses = await databaseService.database
        .collection("courses")
        .find({})
        .toArray();
      expect(courses.length).to.equal(0);
    });
  
    it("should not populate the database with start function if it is already populated", async () => {
      const mongoUri = mongoServer.getUri();
      await databaseService.start(mongoUri);
      let courses = await databaseService.database
        .collection("courses")
        .find({})
        .toArray();
      expect(courses.length).to.equal(0);
      await databaseService.closeConnection();
      await databaseService.start(mongoUri);
      courses = await databaseService.database
        .collection("courses")
        .find({})
        .toArray();
      expect(courses.length).to.equal(0);
    });
  });
  