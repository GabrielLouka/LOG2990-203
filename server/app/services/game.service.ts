import { DatabaseService, dbService } from '@app/services/database.service';
import { FileSystemManager } from '@app/services/file_system_manager';
import { Message } from '@common/message';
import { Service } from 'typedi';
// eslint-disable-next-line no-restricted-imports
import { DB_COLLECTION_GAMES } from '../utils/env';

// eslint-disable-next-line @typescript-eslint/no-require-imports
import path = require('path');

@Service()
export class GameService {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    JSON_PATH: string;
    fileSystemManager: FileSystemManager;
    dbService: DatabaseService;
    constructor() {
        this.JSON_PATH = path.join(__dirname + '../../data/games.json');
        this.fileSystemManager = new FileSystemManager();
        this.dbService = dbService;
    }
    get collection() {
        return this.dbService.db.collection(DB_COLLECTION_GAMES);
    }
    async getAllGames() {
        return await this.collection.find({}).toArray();
    }
    async getGameById(id: string) {
        const query = { id: parseInt(id, 10) };
        return await this.collection.findOne(query);
    }
    async currentTime(): Promise<Message> {
        return {
            title: 'Time',
            body: new Date().toString(),
        };
    }
    async populateDb() {
        const games = JSON.parse(await this.fileSystemManager.readFile(this.JSON_PATH)).games;
        await this.dbService.populateDb(DB_COLLECTION_GAMES, games);
    }
}
