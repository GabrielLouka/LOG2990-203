/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { DatabaseService } from '@app/services/database.service';
import { FileSystemManager } from '@app/services/file-system-manager';
import { GameData } from '@common/game-data';
// eslint-disable-next-line no-unused-vars
import { DB_CONST, R_ONLY } from '@app/utils/env';
import { defaultRankings } from '@common/ranking';
import { Vector2 } from '@common/vector2';
import 'dotenv/config';
import { mkdir, readFileSync, writeFile, writeFileSync } from 'fs';
import { DeleteResult, UpdateResult } from 'mongodb';
import { Service } from 'typedi';
import { SocketManager } from './socket-manager.service';
@Service()
export class GameStorageService {
    JSON_PATH: string;
    fileSystemManager: FileSystemManager;
    socketManager: SocketManager;

    constructor(private databaseService: DatabaseService) {
        this.JSON_PATH = './app/data/default-games.json';
        this.fileSystemManager = new FileSystemManager();
    }
    get collection() {
        return this.databaseService.database.collection(DB_CONST.DB_COLLECTION_GAMES);
    }

    /**
     * Returns all the available games
     *
     * @returns the games list
     */
    async getAllGames(): Promise<unknown[]> {
        return await this.collection.find({}).toArray();
    }

    /**
     * Gets the game per id
     *
     * @param id identifier of the game
     * @returns returns the matching game
     */
    async getGameById(id: string) {
        const query = { id: parseInt(id, 10) };
        // return await this.collection.findOne(query);
        const game = await this.collection.findOne(query);
        const folderPath = R_ONLY.persistentDataFolderPath + id + '/';
        const firstImage = readFileSync(folderPath + '1.bmp');
        const secondImage = readFileSync(folderPath + '2.bmp');

        try {
            console.log(`Buffer length first image: ${firstImage.length} bytes`);
            console.log(`Buffer length second image: ${secondImage.length} bytes`);
            console.log('gameData is ' + game!.name + game!.id);
            // const imageElement = new Image();
            // imageElement.src = `data:image/bmp;base64,${originalImage.toString('base64')}`;
            // document.body.appendChild(imageElement);
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(`Error reading image file: ${error.message}`);
        }
        return { gameData: game, originalImage: firstImage, modifiedImage: secondImage };
    }

    async updateGameName(gameId: number, newName: string): Promise<UpdateResult> {
        return this.collection.updateOne({ id: gameId }, { $set: { name: newName } });
    }

    // TODO À tester !!
    /**
     * @param id game identifier
     * @returns true if deleted, false if not
     */
    async deleteGame(id: string): Promise<boolean> {
        const res = await this.collection.findOneAndDelete({ id });
        return res.value !== null;
    }

    async deleteAllGames(): Promise<DeleteResult> {
        return this.collection.deleteMany({});
    }

    async getNextGames(pageNbr: number) {
        // checks if the number of games available for one page is under four
        const skipNbr = pageNbr * R_ONLY.gamesLimit;
        const nextGames = await this.collection.find({}).skip(skipNbr).limit(R_ONLY.gamesLimit).toArray();

        let folderPath;
        const theGames = [];
        for (const game of nextGames) {
            console.log(game.id);
            folderPath = R_ONLY.persistentDataFolderPath + game.id + '/';
            const firstImage = readFileSync(folderPath + '1.bmp');
            const secondImage = readFileSync(folderPath + '2.bmp');

            const originalImagePath = folderPath + '1.bmp';
            console.log(`Original image path: ${originalImagePath}`);

            try {
                const originalImage = readFileSync(originalImagePath);
                console.log(`Buffer length: ${originalImage.length} bytes`);
                // const imageElement = new Image();
                // imageElement.src = `data:image/bmp;base64,${originalImage.toString('base64')}`;
                // document.body.appendChild(imageElement);
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error(`Error reading image file: ${error.message}`);
            }
            game.ranking = defaultRankings;
            theGames.push({
                gameData: game,
                originalImage: firstImage,
                modifiedImage: secondImage,
            });
        }
        return theGames;
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
            const data = readFileSync(R_ONLY.gamesLimit + R_ONLY.lastGameIdFileName);
            lastGameId = parseInt(data.toString(), 10);
            const nextGameId = lastGameId + 1;
            writeFileSync(R_ONLY.gamesLimit + R_ONLY.lastGameIdFileName, nextGameId.toString());
            output = nextGameId;
        } catch (err) {
            writeFileSync(R_ONLY.gamesLimit + R_ONLY.lastGameIdFileName, '0');
            output = 0;
        }

        return output;
    }

    createFolder(folderPath: string) {
        mkdir(folderPath, { recursive: true }, (err) => {
            if (err) {
                // eslint-disable-next-line no-console
                console.error(err);
            } else {
                // eslint-disable-next-line no-console
                console.log('Folder successfully created.');
            }
        });
    }

    storeGameImages(gameId: number, firstImage: Buffer, secondImage: Buffer): void {
        const folderPath = R_ONLY.gamesLimit + gameId + '/';
        // Creates the subfolder for the game if it does not exist
        this.createFolder(folderPath);

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

    async storeGameResult(generatedGameId: number, _differences: Vector2[][], _isEasy: boolean) {
        const newGameToAdd: GameData = {
            id: generatedGameId,
            nbrDifferences: _differences.length,
            differences: _differences,
            name: 'Default game',
            isEasy: _isEasy,
            ranking: defaultRankings,
        };
        return this.collection.insertOne(newGameToAdd);
    }

    // async populateDb() {
    //     const playlists = JSON.parse(await this.fileSystemManager.readFile(this.JSON_PATH)).playlists;
    //     await this.databaseService.populateDb(DB_CONST.DB_COLLECTION_GAMES, games);
    // }
}
