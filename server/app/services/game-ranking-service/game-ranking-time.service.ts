import { GameStorageService } from '@app/services/game-storage-service/game-storage.service';
import { GameData } from '@common/interfaces/game-data';
import { RankingData } from '@common/interfaces/ranking.data';
import { Service } from 'typedi';

@Service()
export class GameRankingService {
    private currentGame: GameData | null;
    // private indexToUpdate: number | null;
    private newRanking: { name: string; score: number };
    private matchType: string;

    constructor(private readonly gameStorageService: GameStorageService) {}

    async handleNewScore(
        gameId: string,
        isOneVersusOne: boolean,
        ranking: {
            name: string;
            score: number;
        },
    ): Promise<RankingData | void> {
        this.newRanking = ranking;
        this.matchType = '1 contre 1';
        return await this.updateOneVersusOneRanking(gameId);
    }

    // private isBreakingScore(currentRanking: Ranking[]): boolean {
    //     currentRanking.filter((ranking, index) => {
    //         if (ranking.score > this.newRanking.score) {
    //             this.indexToUpdate = index;
    //         }
    //     });
    //     return this.indexToUpdate ? true : false;
    // }

    private async updateOneVersusOneRanking(gameId: string): Promise<RankingData | void> {
        try {
            const updateRankingIndex = await this.gameStorageService.updateGameSoloNewBreakingRecord(gameId, this.newRanking);
            if (updateRankingIndex && this.currentGame) {
                return {
                    username: this.newRanking.name.toUpperCase(),
                    position: updateRankingIndex.toString(),
                    gameName: this.currentGame.name,
                    matchType: this.matchType,
                } as RankingData;
            }
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e);
        }
    }

    // private async getGameRanking(gameId: string, isOneVersusOne: boolean): Promise<Ranking[] | void> {
    //     return isOneVersusOne ? await this.getGameOneVersusOneRanking(gameId) : await this.getGameSoloRanking(gameId);
    // }

    // private async getGameOneVersusOneRanking(id: string): Promise<Ranking[] | void> {
    //     this.currentGame = (await this.gameStorageService.getGameById(id)).gameData;
    //     if (!this.currentGame) return;
    //     return this.currentGame.oneVersusOneRanking;
    // }

    // private async getGameSoloRanking(id: string): Promise<Ranking[] | void> {
    //     this.currentGame = (await this.gameStorageService.getGameById(id)).gameData;
    //     if (!this.currentGame) return;
    //     return this.currentGame.soloRanking;
    // }
}
