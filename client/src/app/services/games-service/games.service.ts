import { Injectable } from '@angular/core';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { SocketClientService } from '@app/services/socket-client-service/socket-client.service';
import { GameData } from '@common/interfaces/game-data';
import { MAX_GAMES_PER_PAGE } from '@common/utils/env';
import { Buffer } from 'buffer';

@Injectable({
    providedIn: 'root',
})
export class GamesService {
    currentPageNbr: number = 0;
    games: {
        gameData: GameData;
        originalImage: Buffer;
        matchToJoinIfAvailable: string | null;
    }[];
    title: string;
    gamesNbr: number = 0;
    showNextButton = false;
    isLoading = true;

    showPreviousButton = false;

    constructor(private readonly communicationService: CommunicationService, private readonly socketService: SocketClientService) {}

    async fetchGameDataFromServer(pageId: number): Promise<void> {
        this.showNextButton = false;
        this.isLoading = true;
        const routeToSend = '/games/' + pageId.toString();
        this.communicationService.get(routeToSend).subscribe({
            next: (response) => {
                if (response.body) {
                    this.isLoading = false;
                    const serverResult = JSON.parse(response.body);
                    this.games = serverResult.gameContent;
                    this.gamesNbr = serverResult.nbrOfGame;
                    this.showNextButton = this.gamesNbr - (this.currentPageNbr + 1) * MAX_GAMES_PER_PAGE > 0;
                }
            },
        });
    }

    async deleteAllGames(isDeleteRequest: boolean): Promise<void> {
        if (isDeleteRequest) {
            const routeToSend = '/games/allGames';
            this.communicationService.delete(routeToSend).subscribe({
                next: (response) => {
                    if (response.body) {
                        this.gamesNbr = 0;
                        this.reloadPage();
                    }
                },
            });
            this.socketService.socket.emit('deleteAllGames');
        }
    }

    async deleteSelectedGame(isDeleteRequest: boolean, id: string): Promise<void> {
        if (isDeleteRequest) {
            const routeToSend = '/games/' + id;

            this.communicationService.delete(routeToSend).subscribe({
                next: (response) => {
                    if (response.body) {
                        this.reloadPage();
                    }
                },
            });
            this.socketService.socket.emit('deletedGame', { hasDeletedGame: true, id });
        }
    }

    async changeGamePages(isNext: boolean) {
        this.currentPageNbr = isNext ? this.currentPageNbr + 1 : this.currentPageNbr - 1;
        if (this.currentPageNbr > 0) {
            this.showPreviousButton = true;
        } else {
            this.showPreviousButton = false;
        }
        await this.fetchGameDataFromServer(this.currentPageNbr);
    }

    reloadPage() {
        window.location.reload();
    }
}
