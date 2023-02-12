/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai';
import { OptionalId } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as sinon from 'sinon';
import { DatabaseService } from './database.service';
describe('Database service', () => {
    let databaseService: DatabaseService;
    let mongoServer: MongoMemoryServer;

    beforeEach(async () => {
        databaseService = new DatabaseService();
        mongoServer = await MongoMemoryServer.create();
    });

    afterEach(async () => {
        await databaseService.closeConnection();
    });

    it('should connect to the database when start is called', async () => {
        const mongoUri = mongoServer.getUri();
        await databaseService.start(mongoUri);
        expect(databaseService['client']).to.not.be.undefined;
        expect(databaseService['db'].databaseName).to.equal('LOG2990');
    });

    it('should not create a new client', async () => {
        const mongoUri = mongoServer.getUri();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await databaseService.start(mongoUri);
        await databaseService.start(mongoUri);
        expect(databaseService['client']).to.not.be.undefined;
    });

    it('populateDb should add data to database', async () => {
        const DATABASE_NAME = 'testDatabase';
        const mongoUri = mongoServer.getUri();
        await databaseService.start(mongoUri);
        await databaseService.database.collection(DATABASE_NAME).insertOne({ id: 5 });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const database: OptionalId<Document> = (await databaseService.database.collection(DATABASE_NAME).find({})) as any;
        const insertManySpy: sinon.SinonSpy = sinon.spy(databaseService.database.collection(DATABASE_NAME), 'insertMany');
        await databaseService.populateDb(DATABASE_NAME, [database]);
        sinon.assert.notCalled(insertManySpy);
    });
});
