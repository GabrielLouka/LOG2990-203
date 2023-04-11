/* eslint-disable no-restricted-imports */
/* eslint-disable no-console */
import { DatabaseService } from '@app/services/database-service/database.service';
import { Service } from 'typedi';
import { MatchStatus } from '@common/enums/match-status';
import { MatchType } from '@common/enums/match-type';
import { Player } from '@common/classes/player';
import { ObjectId } from 'mongodb';

@Service()
export class HistoryStorageService {
    historyToSave: {
        _id: ObjectId;
        startingTime: Date;
        gameMode: MatchType | undefined;
        duration: string;
        player1: Player | null;
        player2: Player | null;
        endStatus: MatchStatus;
    };
    constructor(private databaseService: DatabaseService) {
        this.historyToSave = {
            _id: new ObjectId(),
            startingTime: new Date(),
            duration: '',
            gameMode: MatchType.LimitedCoop,
            player1: { username: '', playerId: '' },
            player2: { username: '', playerId: '' },
            endStatus: MatchStatus.InProgress,
        };
    }

    get collection() {
        return this.databaseService.database.collection(process.env.DATABASE_COLLECTION_HISTORY as string);
    }

    set player1(player1: Player | null) {
        this.historyToSave.player1 = player1;
    }

    set player2(player2: Player | null) {
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

    set endStatus(endStatus: MatchStatus) {
        this.historyToSave.endStatus = endStatus;
    }

    set gameMode(gameMode: MatchType | undefined) {
        this.historyToSave.gameMode = gameMode;
    }

    async getAllHistory(): Promise<unknown[]> {
        return await this.collection.find({}).toArray();
    }

    async wipeHistory(): Promise<void> {
        await this.collection.deleteMany({});
    }

    async storeHistory() {
        console.log(this.historyToSave);
        return this.collection.insertOne(this.historyToSave);
    }
}
