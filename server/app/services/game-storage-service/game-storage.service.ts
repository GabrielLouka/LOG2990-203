/* eslint-disable no-console */
import { DatabaseService } from '@app/services/database-service/database.service';
import { FileSystemManager } from '@app/services/file-system/file-system-manager';
import { DISPLAYED_GAMES_LIMIT, LAST_GAME_ID_FILE, MODIFIED_IMAGE_FILE, ORIGINAL_IMAGE_FILE, PERSISTENT_DATA_FOLDER_PATH } from '@app/utils/env';
import { GameData } from '@common/interfaces/game-data';
import { Ranking, defaultRanking } from '@common/interfaces/ranking';
import 'dotenv/config';
import { mkdir, readFileSync, readdir, rmdir, writeFile, writeFileSync } from 'fs';
import { InsertOneResult } from 'mongodb';
import 'reflect-metadata';
import { Service } from 'typedi';

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
            const data = readFileSync(PERSISTENT_DATA_FOLDER_PATH + LAST_GAME_ID_FILE);
            lastGameId = parseInt(data.toString(), 10);
            const nextGameId = lastGameId + 1;
            writeFileSync(PERSISTENT_DATA_FOLDER_PATH + LAST_GAME_ID_FILE, nextGameId.toString());
            output = nextGameId;
        } catch (err) {
            writeFileSync(PERSISTENT_DATA_FOLDER_PATH + LAST_GAME_ID_FILE, '0');
            output = 0;
        }

        return output;
    }

    async deleteStoredDataForAllTheGame(): Promise<void> {
        readdir(PERSISTENT_DATA_FOLDER_PATH, { withFileTypes: true }, (err, files) => {
            if (err) {
                console.error(err);
            } else {
                files.forEach((file) => {
                    if (file.isDirectory()) {
                        const folderPath = `${PERSISTENT_DATA_FOLDER_PATH}/${file.name}`;
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
        readdir(PERSISTENT_DATA_FOLDER_PATH, { withFileTypes: true }, (err, files) => {
            if (err) {
                console.error(err);
            } else {
                files.forEach(async (file) => {
                    if (file.name === gameId) {
                        const folderPath = `${PERSISTENT_DATA_FOLDER_PATH}/${file.name}`;
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
        // gamesToReturn.sort(() => Math.random() - 1 / 2);
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
        const images = this.getGameImages(id);
        return { gameData: game, originalImage: images.originalImage, modifiedImage: images.modifiedImage };
    }

    /**
     * @param id game identifier
     * @returns true if deleted, false if not
     */
    async deleteById(id: string): Promise<void> {
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
        const skipNumber = pageNumber * DISPLAYED_GAMES_LIMIT;
        const nextGames = await this.collection
            .find<GameData>({}, { projection: { differences: 0, nbrDifferences: 0 } })
            .skip(skipNumber)
            .limit(DISPLAYED_GAMES_LIMIT)
            .toArray();

        const gamesToReturn = [];
        for (const game of nextGames) {
            // const images = this.getGameImages(game.id.toString());
            gamesToReturn.push({
                gameData: game,
                originalImage: 'http://ec2-35-183-123-130.ca-central-1.compute.amazonaws.com:3000/api' + '/images/' + game.id.toString() + '/1',
                matchToJoinIfAvailable: null,
            });
        }
        return gamesToReturn;
    }

    getGameImages(id: string) {
        const folderPath = PERSISTENT_DATA_FOLDER_PATH + id + '/';
        let firstImage = Buffer.from([0]);
        let secondImage = Buffer.from([0]);

        try {
            firstImage = readFileSync(folderPath + ORIGINAL_IMAGE_FILE);
        } catch (error) {
            console.log('error reading first image');
        }

        try {
            secondImage = readFileSync(folderPath + MODIFIED_IMAGE_FILE);
        } catch (error) {
            console.log('error reading second image');
        }

        return { originalImage: firstImage, modifiedImage: secondImage };
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
        } catch (e) {
            console.error('update error : ' + e);
        }
        return (await this.getGameById(id)).gameData?.soloRanking.findIndex((ranking) => ranking.name === newBreakingRanking.name);
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
        } catch (e) {
            console.error('update error : ' + e);
        }
        return (await this.getGameById(id)).gameData?.oneVersusOneRanking.findIndex((ranking) => ranking.name === newBreakingRanking.name);
    }

    async resetScoresById(id: string) {
        const query = { id: parseInt(id, 10) };
        console.log('GAME RESET BY ID');
        const resetRanking = { $set: { oneVersusOneRanking: defaultRanking, soloRanking: defaultRanking } };
        try {
            await this.collection.findOneAndUpdate(query, resetRanking);
        } catch (e) {
            console.error('update error : ' + e);
        }
    }

    async resetAllScores() {
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
        const folderPath = PERSISTENT_DATA_FOLDER_PATH + id + '/';
        // Creates the subfolder for the game if it does not exist
        this.createFolder(folderPath);

        writeFile(folderPath + ORIGINAL_IMAGE_FILE, firstImage, this.writeFileErrorManagement);
        writeFile(folderPath + MODIFIED_IMAGE_FILE, secondImage, this.writeFileErrorManagement);
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
