/* eslint-disable no-console */
import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { HistoryData } from '@common/interfaces/history-data';

@Injectable({
    providedIn: 'root',
})
export class HistoryService {
    history: HistoryData[] = [];
    gameStartingTime: string | null;
    historyToSave: { startingTime: string | null; gameMode: string; duration: string; player1: string; player2: string; isWinByDefault: boolean };
    constructor(private readonly communicationService: CommunicationService) {}

    fetchHistoryFromServer() {
        const routeToSend = '/history/';
        this.communicationService.get(routeToSend).subscribe({
            next: (response) => {
                if (response.body !== null) {
                    this.history = JSON.parse(response.body).reverse();
                }
            },
        });
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

    saveStartGameTime() {
        const newDate = new Date();
        const datePipe = new DatePipe('en-US');
        this.gameStartingTime = datePipe.transform(newDate, 'dd.MM.yyyy - HH:mm');
    }

    // eslint-disable-next-line max-params
    createHistoryData(winningPlayer: string, isWinByDefault: boolean, isSoloMode: boolean, player1: string, player2: string, endGameTime: string) {
        const gameMode = isSoloMode ? 'Classic - Solo' : 'Classic - 1vs1';
        const time = endGameTime;

        const player1Username = isSoloMode ? player1 : winningPlayer;
        const player2Username = isSoloMode ? '' : player2 === winningPlayer ? player1 : player2;
        this.historyToSave = {
            startingTime: this.gameStartingTime,
            duration: time,
            gameMode,
            player1: player1Username,
            player2: player2Username,
            isWinByDefault,
        };

        this.addGameHistory(this.historyToSave);
    }
}
