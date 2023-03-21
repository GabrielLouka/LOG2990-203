import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { DeleteGamesPopUpComponent } from '@app/components/delete-games-pop-up/delete-games-pop-up.component';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { MatchmakingService } from '@app/services/matchmaking-service/matchmaking.service';
import { SocketClientService } from '@app/services/socket-client-service/socket-client.service';
import { GameData } from '@common/interfaces/game-data';
import { ImageUploadResult } from '@common/interfaces/image.upload.result';
import { Buffer } from 'buffer';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-games-display',
    templateUrl: './games-display.component.html',
    styleUrls: ['./games-display.component.scss'],
})
export class GamesDisplayComponent implements OnInit {
    @Input() isSelection: boolean;
    @ViewChild('popUpElement') popUpElement: DeleteGamesPopUpComponent;

    debugDisplayMessage: BehaviorSubject<string> = new BehaviorSubject<string>('');
    currentPageNbr: number = 0;
    games: {
        gameData: GameData;
        originalImage: Buffer;
        matchToJoinIfAvailable: string | null;
    }[];
    title: string;
    gamesNbr: number = 0;
    isLoading = true;

    showPreviousButton = false;
    showNextButton = false;
    constructor(
        private readonly communicationService: CommunicationService,
        private readonly matchmakingService: MatchmakingService,
        private readonly socketService: SocketClientService,
    ) {}
    ngOnInit() {
        this.title = this.isSelection ? 'Page de configuration' : 'Page de selection';
        this.fetchGameDataFromServer(this.currentPageNbr);
        this.matchmakingService.connectSocket();
        this.addServerSocketMessagesListeners();
    }

    async fetchGameDataFromServer(pageId: number): Promise<void> {
        this.showNextButton = false;
        this.isLoading = true;
        const routeToSend = '/games/' + pageId.toString();
        const numberOfGamesInAPage = 4;
        this.communicationService.get(routeToSend).subscribe({
            next: (response) => {
                if (response.body !== null) {
                    this.isLoading = false;
                    const serverResult = JSON.parse(response.body);
                    this.games = serverResult.gameContent;
                    this.gamesNbr = serverResult.nbrOfGame;
                    this.showNextButton = this.gamesNbr - (this.currentPageNbr + 1) * numberOfGamesInAPage > 0;
                }
            },
            error: (err: HttpErrorResponse) => {
                const responseString = `Server Error : ${err.message}`;
                const serverResult: ImageUploadResult = JSON.parse(err.error);
                this.debugDisplayMessage.next(responseString + '\n' + serverResult.message);
            },
        });
    }

    async deleteAllGames(isDeleteRequest: boolean): Promise<void> {
        if (isDeleteRequest) {
            const routeToSend = '/games/deleteAllGames';
            this.communicationService.delete(routeToSend).subscribe({
                next: (response) => {
                    if (response.body !== null) {
                        this.gamesNbr = 0;
                        this.reloadPage();
                    }
                },
                error: (err: HttpErrorResponse) => {
                    const responseString = `Server Error : ${err.message}`;
                    const serverResult = JSON.parse(err.error);
                    this.debugDisplayMessage.next(responseString + '\n' + serverResult.message);
                },
            });
            this.socketService.socket.emit('deleteAllGames', { gameToDelete: true });
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

    addServerSocketMessagesListeners() {
        this.socketService.on('gameProgressUpdate', (data: { gameId: number; matchToJoinIfAvailable: string | null }) => {
            this.updateGameAvailability(data.gameId, data.matchToJoinIfAvailable);
        });
        this.socketService.on('actionOnGameReloadingThePage', () => {
            const pathSegments = window.location.href.split('/');
            const pageName = pathSegments[pathSegments.length - 2];
            if (pageName === 'selections' || pageName === 'config') {
                this.reloadPage();
            }
        });
    }

    updateGameAvailability(gameId: number, matchToJoinIfAvailable: string | null) {
        for (const game of this.games) {
            if (game.gameData.id.toString() === gameId.toString()) {
                game.matchToJoinIfAvailable = matchToJoinIfAvailable;
                break;
            }
        }
    }
    reloadPage() {
        window.location.reload();
    }
}
