/* eslint-disable no-console */
import { DatabaseService } from '@app/services/database-service/database.service';
import { FileSystemManager } from '@app/services/file-system/file-system-manager';
import { SocketManager } from '@app/services/socket-manager-service/socket-manager.service';
import { R_ONLY } from '@app/utils/env';
import { GameData } from '@common/interfaces/game-data';
import 'dotenv/config';
import { mkdir, readdir, readFileSync, rmdir, writeFile, writeFileSync } from 'fs';
import 'reflect-metadata';
import { Service } from 'typedi';
@Service()
export class GameStorageService {
    jsonPath: string;
    fileSystemManager: FileSystemManager;
    socketManager: SocketManager;

    constructor(private databaseService: DatabaseService) {
        this.jsonPath = './app/data/default-games.json';
        this.fileSystemManager = new FileSystemManager();
    }
    get collection() {
        return this.databaseService.database.collection(process.env.DATABASE_COLLECTION_GAMES as string);
    }
    async deleteStoredDataForAllTheGame(): Promise<void> {
        readdir(R_ONLY.persistentDataFolderPath, { withFileTypes: true }, (err, files) => {
            if (err) {
                console.error(err);
            } else {
                files.forEach((file) => {
                    if (file.isDirectory()) {
                        const folderPath = `${R_ONLY.persistentDataFolderPath}/${file.name}`;
                        rmdir(folderPath, { recursive: true }, (error) => {
                            if (error) {
                                console.error(error);
                            } else {
                                console.log(`Folder ${folderPath} deleted successfully.`);
                            }
                        });
                    }
                });
            }
        });
    }
    async deleteStoredData(gameId: string): Promise<void> {
        readdir(R_ONLY.persistentDataFolderPath, { withFileTypes: true }, (err, files) => {
            if (err) {
                console.error(err);
            } else {
                files.forEach(async (file) => {
                    if (file.name === gameId) {
                        const folderPath = `${R_ONLY.persistentDataFolderPath}/${file.name}`;
                        rmdir(folderPath, { recursive: false }, (error) => {
                            if (error) {
                                console.error(error);
                            } else {
                                console.log(`Folder ${folderPath} deleted successfully.`);
                            }
                        });
                        return;
                    }
                });
            }
        });
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
     * Returns the number of games
     *
     * @returns the games list
     */
    async getGamesLength() {
        return this.collection.countDocuments({});
    }

    /**
     * Gets the game per id
     *
     * @param id identifier of the game
     * @returns returns the matching game
     */
    async getGameById(id: string) {
        const query = { id: parseInt(id, 10) };
        const game = await this.collection.findOne<GameData>(query);
        const images = this.getGameImages(id);
        return { gameData: game, originalImage: images.originalImage, modifiedImage: images.modifiedImage };
    }

    /**
     * @param id game identifier
     * @returns true if deleted, false if not
     */
    async deleteGame(id: string) {
        const query = { id: parseInt(id, 10) };
        await this.collection.findOneAndDelete(query);
        await this.deleteStoredData(id);
    }

    async allGames() {
        await this.deleteStoredDataForAllTheGame();
        await this.collection.deleteMany({});
    }

    async getGamesInPage(pageNbr: number): Promise<
        {
            gameData: GameData;
            originalImage: Buffer;
            matchToJoinIfAvailable: string | null;
        }[]
    > {
        // checks if the number of games available for one page is under four
        const skipNbr = pageNbr * R_ONLY.gamesLimit;
        const nextGames = await this.collection.find<GameData>({}).skip(skipNbr).limit(R_ONLY.gamesLimit).toArray();

        const gamesToReturn = [];
        for (const game of nextGames) {
            const images = this.getGameImages(game.id.toString());
            gamesToReturn.push({
                gameData: game,
                originalImage: images.originalImage,
                matchToJoinIfAvailable: null,
            });
        }
        return gamesToReturn;
    }

    getGameImages(id: string) {
        const folderPath = R_ONLY.persistentDataFolderPath + id + '/';
        let firstImage = Buffer.from([0]);
        let secondImage = Buffer.from([0]);

        try {
            firstImage = readFileSync(folderPath + R_ONLY.originalImageFileName);
        } catch (error) {
            console.log('error reading first image');
        }

        try {
            secondImage = readFileSync(folderPath + R_ONLY.modifiedImageFileName);
        } catch (error) {
            console.log('error reading second image');
        }

        return { originalImage: firstImage, modifiedImage: secondImage };
    }

    async storeDefaultGames() {
        const games = JSON.parse(await this.fileSystemManager.readFile(this.jsonPath)).games;
        await this.databaseService.populateDb(process.env.DATABASE_COLLECTION_GAMES as string, games);
    }

    getNextAvailableGameId(): number {
        let output = -1;
        // read the next id from the file lastGameId.txt if it exists or create it with 0
        try {
            let lastGameId = 0;
            const data = readFileSync(R_ONLY.persistentDataFolderPath + R_ONLY.lastGameIdFileName);
            lastGameId = parseInt(data.toString(), 10);
            const nextGameId = lastGameId + 1;
            writeFileSync(R_ONLY.persistentDataFolderPath + R_ONLY.lastGameIdFileName, nextGameId.toString());
            output = nextGameId;
        } catch (err) {
            writeFileSync(R_ONLY.persistentDataFolderPath + R_ONLY.lastGameIdFileName, '0');
            output = 0;
        }

        return output;
    }

    createFolder(folderPath: string) {
        mkdir(folderPath, { recursive: true }, (err) => {
            if (err) {
                console.error('Folder was not created');
            } else {
                console.log('Folder successfully created.');
            }
        });
    }

    storeGameImages(gameId: number, firstImage: Buffer, secondImage: Buffer): void {
        const folderPath = R_ONLY.persistentDataFolderPath + gameId + '/';
        // Creates the subfolder for the game if it does not exist
        this.createFolder(folderPath);

        writeFile(folderPath + R_ONLY.originalImageFileName, firstImage, this.writeFileErrorManagement);
        writeFile(folderPath + R_ONLY.modifiedImageFileName, secondImage, this.writeFileErrorManagement);
    }

    /**
     * Checks and validates if the file was successfully written
     *
     * @param err
     */
    writeFileErrorManagement = (err: NodeJS.ErrnoException) => {
        if (err) {
            console.error('File was not successfully written');
        } else {
            console.log('File successfully written.');
        }
    };

    async storeGameResult(newGameToAdd: GameData) {
        return this.collection.insertOne(newGameToAdd);
    }
}
