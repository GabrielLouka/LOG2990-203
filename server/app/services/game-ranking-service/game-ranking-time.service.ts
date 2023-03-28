import { GameStorageService } from '@app/services/game-storage-service/game-storage.service';
import { GameData } from '@common/interfaces/game-data';
import { Service } from 'typedi';

@Service()
export class GameRankingService {
    private currentGame: GameData | null;

    constructor(private readonly gameStorageService: GameStorageService) {}

    async getGameOneVersusOneRanking(id: string) {
        this.currentGame = (await this.gameStorageService.getGameById(id)).gameData;
        if (!this.currentGame) return;
        return this.currentGame.oneVersusOneRanking;
    }

    async getGameSoloRanking(id: string) {
        this.currentGame = (await this.gameStorageService.getGameById(id)).gameData;
        if (!this.currentGame) return;
        return this.currentGame.soloRanking;
    }
}
