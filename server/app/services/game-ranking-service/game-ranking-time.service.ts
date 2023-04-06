import { GameStorageService } from '@app/services/game-storage-service/game-storage.service';
import { RankingData } from '@common/interfaces/ranking.data';
import { Service } from 'typedi';

@Service()
export class GameRankingService {
    private gameName: string;
    private newRanking: { name: string; score: number; gameName: string };
    private matchType: string;

    constructor(private readonly gameStorageService: GameStorageService) {}

    async handleNewScore(
        gameId: string,
        isOneVersusOne: boolean,
        ranking: {
            name: string;
            score: number;
            gameName: string;
        },
    ): Promise<RankingData | void> {
        this.newRanking = ranking;
        this.gameName = ranking.gameName;
        this.matchType = isOneVersusOne ? '1 contre 1' : 'Solo';
        return await this.updateRanking(gameId, isOneVersusOne);
    }

    async updateRanking(gameId: string, isOneVersusOne: boolean): Promise<RankingData | void> {
        try {
            console.log('ICI tabarnak');
            const updateRankingIndex = isOneVersusOne
                ? await this.gameStorageService.updateGameOneVersusOneNewBreakingRecord(gameId, this.newRanking)
                : await this.gameStorageService.updateGameSoloNewBreakingRecord(gameId, this.newRanking);
            if (updateRankingIndex) {
                return {
                    username: this.newRanking.name.toUpperCase(),
                    position: (updateRankingIndex + 1).toString(),
                    gameName: this.gameName,
                    matchType: this.matchType,
                } as RankingData;
            }
        } catch (e) {
            return Promise.reject('The game is null');
        }
    }
}
