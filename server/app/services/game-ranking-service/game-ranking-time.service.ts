import { GameStorageService } from '@app/services/game-storage-service/game-storage.service';
import { GameData } from '@common/interfaces/game-data';
import { Ranking } from '@common/interfaces/ranking';
import { RankingData } from '@common/interfaces/ranking.data';
import { Service } from 'typedi';

@Service()
export class GameRankingService {
    private currentGame: GameData | null;
    private indexToUpdate: number | null;
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
        return await this.updateOneVersusOneRanking(gameId, isOneVersusOne);
    }

    private isBreakingScore(currentRanking: Ranking[]): boolean {
        currentRanking.filter((ranking, index) => {
            if (ranking.score > this.newRanking.score) {
                this.indexToUpdate = index;
            }
        });
        return this.indexToUpdate ? true : false;
    }

    private async updateOneVersusOneRanking(gameId: string, isOneVersusOne: boolean): Promise<RankingData | void> {
        try {
            const currentRanking = await this.getGameRanking(gameId, isOneVersusOne);
            if (currentRanking) {
                const shouldUpdateRanking = this.isBreakingScore(currentRanking);
                if (shouldUpdateRanking && this.indexToUpdate && this.currentGame) {
                    return {
                        username: this.newRanking.name.toUpperCase(),
                        position: this.indexToUpdate.toString(),
                        gameName: this.currentGame.name,
                        matchType: this.matchType,
                    } as RankingData;
                }
            }
        } catch (e) {
            alert(e);
        }
    }

    private async getGameRanking(gameId: string, isOneVersusOne: boolean): Promise<Ranking[] | void> {
        return isOneVersusOne ? await this.getGameOneVersusOneRanking(gameId) : await this.getGameSoloRanking(gameId);
    }

    private async getGameOneVersusOneRanking(id: string): Promise<Ranking[] | void> {
        this.currentGame = (await this.gameStorageService.getGameById(id)).gameData;
        if (!this.currentGame) return;
        return this.currentGame.oneVersusOneRanking;
    }

    private async getGameSoloRanking(id: string): Promise<Ranking[] | void> {
        this.currentGame = (await this.gameStorageService.getGameById(id)).gameData;
        if (!this.currentGame) return;
        return this.currentGame.soloRanking;
    }
}
