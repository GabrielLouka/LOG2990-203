/* eslint-disable no-restricted-imports */
/* eslint-disable no-console */
import { DatabaseService } from '@app/services/database-service/database.service';
import { Service } from 'typedi';

@Service()
export class HistoryStorageService {
    constructor(private databaseService: DatabaseService) {}

    get collection() {
        return this.databaseService.database.collection(process.env.DATABASE_COLLECTION_HISTORY as string);
    }

    async getAllHistory(): Promise<unknown[]> {
        return await this.collection.find({}).toArray();
    }

    // async storeDefaultGames() {
    //     const games = JSON.parse(await this.fileSystemManager.readFile(this.jsonPath)).games;
    //     await this.databaseService.populateDb(process.env.DATABASE_COLLECTION_GAMES as string, games);
    // }

    // /**
    //  * Checks and validates if the file was successfully written
    //  *
    //  * @param err
    //  */
    // writeFileErrorManagement = (err: NodeJS.ErrnoException) => {
    //     if (err) {
    //         console.error('File was not successfully written');
    //     } else {
    //         console.log('File successfully written.');
    //     }
    // };

    // async storeGameResult(newGameToAdd: GameData) {
    //     return this.collection.insertOne(newGameToAdd);
    // }
}
