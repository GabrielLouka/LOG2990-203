/* eslint-disable no-restricted-imports */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-console */
import { DatabaseService } from '@app/services/database-service/database.service';
import { FileSystemManager } from '@app/services/file-system/file-system-manager';
import { R_ONLY } from '@app/utils/env';
import { GameData } from '@common/interfaces/game-data';
import { Images } from '@common/interfaces/images;';
import { defaultRanking, Ranking } from '@common/interfaces/ranking';
import 'dotenv/config';
import { mkdir, readdir, readFileSync, rmdir, writeFile, writeFileSync } from 'fs';
import { InsertOneResult } from 'mongodb';
import 'reflect-metadata';
import { Service } from 'typedi';
import { environment } from '../../../../client/src/environments/environment';

@Service()
export class GameStorageService {
    jsonPath: string = './app/data/default-games.json';
    fileSystemManager: FileSystemManager = new FileSystemManager();

    constructor(private databaseService: DatabaseService) {}

    get collection() {
        return this.databaseService.database.collection(process.env.DATABASE_COLLECTION_GAMES as string);
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
    async getAllGames(): Promise<
        {
            gameData: GameData;
            originalImage: Buffer;
            modifiedImage: Buffer;
        }[]
    > {
        const allGames = await this.collection.find<GameData>({}).toArray();

        const gamesToReturn = [];
        for (const game of allGames) {
            const images = this.getGameImages(game.id.toString());
            gamesToReturn.push({
                gameData: game,
                originalImage: images.originalImage,
                modifiedImage: images.modifiedImage,
            });
        }
        gamesToReturn.sort(() => Math.random() - 1 / 2);
        return gamesToReturn;
    }
    /**
     * Returns the number of games
     *
     * @returns the games list
     */
    async getGamesLength() {
        return await this.collection.countDocuments({});
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
        const images: Images = this.getGameImages(id);
        return { gameData: game, images };
    }

    /**
     * @param id game identifier
     * @returns true if deleted, false if not
     */
    async deleteOneById(id: string): Promise<void> {
        const query = { id: parseInt(id, 10) };
        await this.collection.findOneAndDelete(query);
        await this.deleteStoredData(id);
    }

    async deleteAll(): Promise<void> {
        await this.deleteStoredDataForAllTheGame();
        await this.collection.deleteMany({});
    }

    async getGamesInPage(pageNumber: number): Promise<
        {
            gameData: GameData;
            originalImage: string;
            matchToJoinIfAvailable: string | null;
        }[]
    > {
        // checks if the number of games available for one page is under four
        const skipNumber = pageNumber * R_ONLY.gamesLimit;
        const nextGames = await this.collection.find<GameData>({}).skip(skipNumber).limit(R_ONLY.gamesLimit).toArray();

        const gamesToReturn = [];
        for (const game of nextGames) {
            // const images = this.getGameImages(game.id.toString());
            gamesToReturn.push({
                gameData: game,
                originalImage: environment.serverUrl + '/images/' + game.id.toString() + '/1',
                matchToJoinIfAvailable: null,
            });
        }
        return gamesToReturn;
    }

    async getGameImages(id: string): Promise<Images> {
        const folderPath = R_ONLY.persistentDataFolderPath + id + '/';
        let firstImage = Buffer.from([0]);
        let secondImage = Buffer.from([0]);

        try {
            firstImage = readFileSync(folderPath + R_ONLY.originalImageFileName);
        } catch (error) {
            return Promise.reject('error reading first image');
        }

        try {
            secondImage = readFileSync(folderPath + R_ONLY.modifiedImageFileName);
            return { originalImage: firstImage, modifiedImage: secondImage } as Images;
        } catch (error) {
            return Promise.reject('error reading second image');
        }
    }

    async storeDefaultGames() {
        const games = JSON.parse(await this.fileSystemManager.readFile(this.jsonPath)).games;
        await this.databaseService.populateDb(process.env.DATABASE_COLLECTION_GAMES as string, games);
    }

    async updateGameSoloNewBreakingRecord(id: string, newBreakingRanking: Ranking): Promise<number | undefined> {
        const gameData = (await this.getGameById(id)).gameData;
        const query = { id: parseInt(id, 10) };
        const update = { $set: { 'soloRanking.$[elem]': newBreakingRanking } };
        const scoreUpdate = { $push: { soloRanking: { $each: [], $sort: { score: 1 } } } };

        if (!gameData) throw new Error(`Game data not found for game with id ${id}`);
        const options = {
            multi: false,
            arrayFilters: [{ 'elem.score': { $gt: newBreakingRanking.score }, 'elem.name': gameData.soloRanking[2].name }],
        };
        try {
            await this.collection.findOneAndUpdate(query, update, options);
            await this.collection.updateOne(query, scoreUpdate);
            return (await this.getGameById(id)).gameData?.soloRanking.findIndex((ranking) => ranking.name === newBreakingRanking.name);
        } catch (e) {
            return Promise.reject('update error : ' + e);
        }
    }

    async updateGameOneVersusOneNewBreakingRecord(id: string, newBreakingRanking: Ranking): Promise<number | undefined> {
        const gameData = (await this.getGameById(id)).gameData;
        const query = { id: parseInt(id, 10) };
        const update = { $set: { 'oneVersusOneRanking.$[elem]': newBreakingRanking } };
        const scoreUpdate = { $push: { oneVersusOneRanking: { $each: [], $sort: { score: 1 } } } };
        if (!gameData) throw new Error(`Game data not found for game with id ${id}`);

        const options = {
            multi: false,
            arrayFilters: [{ 'elem.score': { $gt: newBreakingRanking.score }, 'elem.name': gameData.oneVersusOneRanking[2].name }],
        };

        try {
            await this.collection.findOneAndUpdate(query, update, options);
            await this.collection.updateOne(query, scoreUpdate);
            return (await this.getGameById(id)).gameData?.oneVersusOneRanking.findIndex((ranking) => ranking.name === newBreakingRanking.name);
        } catch (e) {
            return Promise.reject('update error : ' + e);
        }
    }

    async resetGameRecordTimes(id: string) {
        const query = { id: parseInt(id, 10) };
        const resetRanking = { $set: { oneVersusOneRanking: defaultRanking, soloRanking: defaultRanking } };
        await this.collection.updateOne(query, resetRanking);
    }

    async resetAllGamesRecordTimes() {
        const resetRanking = { $set: { oneVersusOneRanking: defaultRanking, soloRanking: defaultRanking } };
        await this.collection.updateMany({}, resetRanking);
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

    async storeGameImages(id: number, firstImage: Buffer, secondImage: Buffer): Promise<void> {
        const folderPath = R_ONLY.persistentDataFolderPath + id + '/';
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

    async storeGameResult(newGameToAdd: GameData): Promise<InsertOneResult<Document>> {
        return await this.collection.insertOne(newGameToAdd);
    }
}
