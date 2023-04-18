/* eslint-disable @typescript-eslint/no-explicit-any */
import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { MatchType } from '@common/enums/match.type';
import { HistoryData } from '@common/interfaces/history.data';

@Injectable({
    providedIn: 'root',
})
export class HistoryService {
    gameHistories: HistoryData[] = [];
    constructor(private readonly communicationService: CommunicationService) {}

    get history(): HistoryData[] {
        return this.gameHistories;
    }

    get isHistoryEmpty(): boolean {
        return this.gameHistories.length === 0;
    }

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
        const player1Name = (result: any) => {
            if (result.isPlayer1Victory || result.isWinByDefault) {
                return result.player1;
            }
            return result.player2;
        };
        const player2Name = (result: any) => {
            if (result.gameMode === MatchType.Solo || result.gameMode === MatchType.LimitedSolo) {
                return '';
            }
            if (result.isPlayer1Victory || result.isWinByDefault) {
                return result.player2;
            }
            return result.player1;
        };
        this.gameHistories = serverResult.map((result: any) => ({
            startingTime: datePipe.transform(result.startingTime, 'dd.MM.yyyy - HH:mm'),
            duration: result.duration,
            gameMode: this.convertGameModeToString(result.gameMode),
            player1: player1Name(result),
            player2: player2Name(result),
            isWinByDefault: result.isWinByDefault,
            isGameLoose: result.isGameLoose,
        }));
    }

    convertGameModeToString(gameMode: number): string {
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

    reloadPage() {
        window.location.reload();
    }
}
