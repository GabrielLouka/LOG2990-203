import { DatabaseService } from '@app/services/database.service';
import { FileSystemManager } from '@app/services/file_system_manager';
import { Service } from 'typedi';
// eslint-disable-next-line no-restricted-imports
import { Game } from '@app/classes/game';
import 'dotenv/config';
import { WithId } from 'mongodb';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import path = require('path');
@Service()
export class GamesService {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    JSON_PATH: string;
    fileSystemManager: FileSystemManager;

    constructor(private databaseService: DatabaseService) {
        // this.JSON_PATH = path.join(__dirname + '../../data/games.json');
        this.JSON_PATH = path.join(__dirname, '..', '..', '..', '..', '..' + '../../data/games.json');
        this.fileSystemManager = new FileSystemManager();
    }
    get collection() {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.databaseService.database.collection(process.env.DB_COLLECTION_GAMES!);
    }

    async addGame(body: ReadableStream<Uint8Array> | null): Promise<Game> {
        throw new Error('Method not implemented.');
    }

    async getAllGames() {
        return await this.collection.find({}).toArray();
    }
    async getGameById(id: string): Promise<Game> {
        const query = { id: parseInt(id, 10) };
        // return await this.collection.findOne(query);
        return this.collection.findOne(query).then((game: WithId<Game>) => {
            return game;
        });
    }
    async populateDb() {
        const games = JSON.parse(await this.fileSystemManager.readFile(this.JSON_PATH)).games;
        await this.databaseService.populateDb(process.env.DATABASE_COLLECTION_GAMES!, games);
    }
}
