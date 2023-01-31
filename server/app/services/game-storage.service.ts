import { DatabaseService } from '@app/services/database.service';
import { FileSystemManager } from '@app/services/file_system_manager';
import { GameData } from '@common/game-data';
import { Vector2 } from '@common/vector2';
import 'dotenv/config';
import { mkdir, readFileSync, rename, writeFile, writeFileSync } from 'fs';
import { UpdateResult, WithId } from 'mongodb';
import { Service } from 'typedi';
@Service()
export class GameStorageService {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    JSON_PATH: string;
    fileSystemManager: FileSystemManager;
    currentPageNbr: number = 0;
    private readonly persistentDataFolderPath = './stored data/';
    private readonly lastGameIdFileName = 'lastGameId.txt';
    private readonly collectionName = 'games';
    private readonly gamesLimit = 4;
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
    async getNextGames() {
        // this.recalculateIds();
        if ((await this.getAllGames()).length < this.gamesLimit * this.currentPageNbr + this.gamesLimit) {
            console.log('total games available: ' + (await this.getAllGames()).length);
            console.log('games required: ' + (this.gamesLimit * this.currentPageNbr + this.gamesLimit));
            return false;
        }
        const theGames = [];

        const indexStart = this.gamesLimit * this.currentPageNbr;
        const indexEnd = indexStart + this.gamesLimit;

        for (let i = indexStart; i < indexEnd; i++) {
            const folderPath = this.persistentDataFolderPath + i + '/';

            // console.log('current index is' + i);
            // console.log(await (await this.getGameById(i.toString())).name);
            // console.log('path: ' + folderPath);
            const firstImage = readFileSync(folderPath + '1.bmp');
            const secondImage = readFileSync(folderPath + '2.bmp');
            theGames.push({
                game: this.getGameById(i.toString()),
                originalImage: firstImage,
                modifiedImage: secondImage,
            });
        }
        this.currentPageNbr++;

        return theGames;
    }

    async storeDefaultGames() {
        const games = JSON.parse(await this.fileSystemManager.readFile(this.JSON_PATH)).games;
        await this.databaseService.populateDb(process.env.DATABASE_COLLECTION_GAMES!, games);
    }

    async recalculateIds() {
        (await this.getAllGames()).forEach((game, i) => {
            if (game.id !== i) {
                const oldIdFolderPath = this.persistentDataFolderPath + game.id + '/';
                const newIdFolderPath = this.persistentDataFolderPath + i + '/';

                rename(oldIdFolderPath, newIdFolderPath, (err) => {
                    if (err) throw err;
                    console.log('Rename complete!');
                });
                rename(oldIdFolderPath + '1.bmp', newIdFolderPath + '1.bmp', (err) => {
                    if (err) throw err;
                    console.log('Rename complete!');
                });
                rename(oldIdFolderPath + '2.bmp', newIdFolderPath + '2.bmp', (err) => {
                    if (err) throw err;
                    console.log('Rename complete!');
                });
                this.collection.updateOne({ id_: game._id }, { $set: { id: i } });
            }
        });
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
