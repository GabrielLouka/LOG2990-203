import { Injectable } from '@angular/core';
import { SocketClientService } from '@app/services/socket-client-service/socket-client.service';
import { Action } from '@common/classes/action';
import { Match } from '@common/classes/match';

@Injectable({
    providedIn: 'root',
})
export class RankingService {
    onRankingUpdated = new Action<{ updatedMatch: Match }>();
    currentMatch: Match | null;

    constructor(private readonly socketService: SocketClientService) {}

    handleRankingUpdate() {
        this.socketService.on('updateRankingGameTimes', (data: { updatedMatch: Match }) => {
            this.onRankingUpdated.invoke(data);
        });
    }

    sendNewWinningTimeToServer(newWinningTime: number, gameId: string, matchId: string, username: string) {
        this.socketService.send<{ newWinningTime: number; gameId: string; matchId: string; username: string }>('sendCurrentMatchWinningTime', {
            newWinningTime,
            gameId,
            matchId,
            username,
        });
    }

    disconnectSocket() {
        this.socketService.disconnect();
        this.currentMatch = null;
        this.onRankingUpdated = new Action<{ updatedMatch: Match }>();
    }
}
