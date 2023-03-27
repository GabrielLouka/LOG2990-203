/* eslint-disable no-restricted-imports */
/* eslint-disable no-console */
import { DatabaseService } from '@app/services/database-service/database.service';
import { HistoryData } from '@common/interfaces/history-data';
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

    async wipeHistory(): Promise<void> {
        await this.collection.deleteMany({});
    }

    async storeHistory(newHistoryToAdd: HistoryData) {
        return this.collection.insertOne(newHistoryToAdd);
    }
}
