import { DatabaseService } from '@app/services/database.service';
import { FileSystemManager } from '@app/services/file_system_manager';
import { GameData } from '@common/game-data';
import { Vector2 } from '@common/vector2';
import 'dotenv/config';
import { mkdir, readFileSync, writeFile, writeFileSync } from 'fs';
import { UpdateResult, WithId } from 'mongodb';
import { Service } from 'typedi';
@Service()
export class GameStorageService {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    JSON_PATH: string;
    fileSystemManager: FileSystemManager;
    private readonly persistentDataFolderPath = './stored data/';
    private readonly lastGameIdFileName = 'lastGameId.txt';
    private readonly collectionName = 'games';

    constructor(private databaseService: DatabaseService) {
        this.JSON_PATH = './app/data/default-games.json';
        this.fileSystemManager = new FileSystemManager();
    }
    get collection() {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        // return this.databaseService.database.collection(process.env.DB_COLLECTION_GAMES! as string);
        return this.databaseService.database.collection(this.collectionName);
    }

    async getAllGames() {
        return await this.collection.find({}).toArray();
    }
    async getGameById(id: string): Promise<GameData> {
        const query = { id: parseInt(id, 10) };
        // return await this.collection.findOne(query);
        return this.collection.findOne(query).then((game: WithId<GameData>) => {
            return game;
        });
    }
    async storeDefaultGames() {
        const games = JSON.parse(await this.fileSystemManager.readFile(this.JSON_PATH)).games;
        await this.databaseService.populateDb(process.env.DATABASE_COLLECTION_GAMES!, games);
    }

    getNextAvailableGameId(): number {
        let output = -1;
        // read the next id from the file lastGameId.txt if it exists or create it with 0
        try {
            let lastGameId = 0;
            const data = readFileSync(this.persistentDataFolderPath + this.lastGameIdFileName);
            lastGameId = parseInt(data.toString(), 10);
            const nextGameId = lastGameId + 1;
            writeFileSync(this.persistentDataFolderPath + this.lastGameIdFileName, nextGameId.toString());
            output = nextGameId;
        } catch (err) {
            writeFileSync(this.persistentDataFolderPath + this.lastGameIdFileName, '0');
            output = 0;
        }

        return output;
    }

    storeGameImages(gameId: number, firstImage: Buffer, secondImage: Buffer): void {
        const folderPath = this.persistentDataFolderPath + gameId + '/';
        // first, create the subfolder for the game if it does not exist
        mkdir(folderPath, { recursive: true }, (err) => {
            if (err) {
                // eslint-disable-next-line no-console
                console.error(err);
            } else {
                // eslint-disable-next-line no-console
                console.log('Folder successfully created.');
            }
        });

        writeFile(folderPath + '1.bmp', firstImage, (err) => {
            if (err) {
                // eslint-disable-next-line no-console
                console.error(err);
            } else {
                // eslint-disable-next-line no-console
                console.log('File successfully written.');
            }
        });

        writeFile(folderPath + '2.bmp', secondImage, (err) => {
            if (err) {
                // eslint-disable-next-line no-console
                console.error(err);
            } else {
                // eslint-disable-next-line no-console
                console.log('File successfully written.');
            }
        });
    }

    storeGameResult(generatedGameId: number, _differences: Vector2[][]) {
        const newGameToAdd: GameData = {
            id: generatedGameId,
            nbrDifferences: _differences.length,
            differences: _differences,
            name: 'Default game',
            isEasy: true,
        };
        this.collection.insertOne(newGameToAdd);
    }

    async updateGameName(gameId: number, newName: string): Promise<UpdateResult> {
        return this.collection.updateOne({ id: gameId }, { $set: { name: newName } });
    }
}
