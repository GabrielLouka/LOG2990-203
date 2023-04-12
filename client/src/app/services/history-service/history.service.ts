/* eslint-disable no-console */
import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { MatchType } from '@common/enums/match-type';
import { HistoryData } from '@common/interfaces/history-data';

@Injectable({
    providedIn: 'root',
})
export class HistoryService {
    gameHistories: HistoryData[] = [];

    constructor(private readonly communicationService: CommunicationService) {}

    fetchHistoryFromServer() {
        const routeToSend = '/history/';
        this.communicationService.get(routeToSend).subscribe({
            next: (response) => {
                if (response.body !== null) {
                    const serverResult = JSON.parse(response.body).reverse();
                    this.formatHistoryData(serverResult);
                }
            },
        });
    }

    formatHistoryData(serverResult: unknown[]) {
        const datePipe = new DatePipe('en-US');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.gameHistories = serverResult.map((result: any) => {
            const gameHistory: HistoryData = {
                startingTime: result.startingTime,
                duration: result.duration,
                gameMode: this.convertGameModeToSttring(result.gameMode),
                player1: result.gameMode === MatchType.Solo ? result.player1 : result.isPlayer1Victory ? result.player1 : result.player2,
                player2: result.gameMode === MatchType.Solo ? '' : result.isPlayer1Victory ? result.player2 : result.player1,
                isWinByDefault: result.isWinByDefault,
            };
            gameHistory.startingTime = datePipe.transform(gameHistory.startingTime, 'dd.MM.yyyy - HH:mm');
            return gameHistory;
        });
        console.log(this.gameHistories);
    }

    convertGameModeToSttring(gameMode: number): string {
        switch (gameMode) {
            case MatchType.Solo:
                return 'Classique - Solo';
            case MatchType.OneVersusOne:
                return 'Classique - 1vs1';
            case MatchType.LimitedSolo:
                return 'Temps Limité - Solo';
            case MatchType.LimitedCoop:
                return 'Temps Limité - Coop';
            default:
                return 'sus';
        }
    }

    deleteHistory() {
        const routeToSend = '/history/';
        this.communicationService.delete(routeToSend).subscribe({});
        this.reloadPage();
    }

    addGameHistory(history: HistoryData) {
        const routeToSend = '/history/';
        this.communicationService.post<HistoryData>(history, routeToSend).subscribe({});
    }

    reloadPage() {
        window.location.reload();
    }
}
