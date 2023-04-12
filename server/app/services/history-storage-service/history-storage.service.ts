/* eslint-disable no-restricted-imports */
/* eslint-disable no-console */
import { DatabaseService } from '@app/services/database-service/database.service';
import { Service } from 'typedi';
import { MatchType } from '@common/enums/match-type';
import { ObjectId } from 'mongodb';

@Service()
export class HistoryStorageService {
    historyToSave: {
        _id: ObjectId;
        startingTime: Date;
        gameMode: MatchType | undefined;
        duration: string;
        player1: string | undefined;
        player2: string | undefined;
        isWinByDefault: boolean;
        isPlayer1Victory: boolean;
    };
    constructor(private databaseService: DatabaseService) {
        this.historyToSave = {
            _id: new ObjectId(),
            startingTime: new Date(),
            duration: '',
            gameMode: MatchType.LimitedCoop,
            player1: '',
            player2: '',
            isWinByDefault: false,
            isPlayer1Victory: false,
        };
    }

    get collection() {
        return this.databaseService.database.collection(process.env.DATABASE_COLLECTION_HISTORY as string);
    }

    set player1(player1: string | undefined) {
        this.historyToSave.player1 = player1;
    }

    set player2(player2: string | undefined) {
        this.historyToSave.player2 = player2;
    }

    set startingGameTime(startingTime: Date) {
        // eslint-disable-next-line no-underscore-dangle
        this.historyToSave._id = new ObjectId();
        this.historyToSave.startingTime = startingTime;
    }

    set duration(duration: string) {
        this.historyToSave.duration = duration;
    }

    set isWinByDefault(isWinByDefault: boolean) {
        this.historyToSave.isWinByDefault = isWinByDefault;
    }

    set gameMode(gameMode: MatchType | undefined) {
        this.historyToSave.gameMode = gameMode;
    }

    set isPlayer1Victory(isPlayer1Victory: boolean) {
        this.historyToSave.isPlayer1Victory = isPlayer1Victory;
    }

    async getAllHistory(): Promise<unknown[]> {
        return await this.collection.find({}).toArray();
    }

    async wipeHistory(): Promise<void> {
        await this.collection.deleteMany({});
    }

    async storeHistory() {
        return this.collection.insertOne(this.historyToSave);
    }
}
