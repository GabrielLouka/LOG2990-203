import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { DeleteGamesPopUpComponent } from '@app/components/delete-games-pop-up/delete-games-pop-up.component';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { MatchManagerService } from '@app/services/match-manager-service/match-manager.service';
import { SocketClientService } from '@app/services/socket-client-service/socket-client.service';
import { GameData } from '@common/game-data';
import { ImageUploadResult } from '@common/image.upload.result';
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
    justifyContent: string;
    showNextButton = true;

    showPreviousButton = false;
    constructor(
        private readonly communicationService: CommunicationService,
        private readonly matchManagerService: MatchManagerService,
        private readonly socketService: SocketClientService,
    ) {}
    ngOnInit() {
        this.title = this.isSelection ? 'Page de configuration' : 'Page de selection';
        this.justifyContent = this.isSelection ? 'center' : 'right';
        this.fetchGameDataFromServer(this.currentPageNbr);
        this.matchManagerService.connectSocket();
        this.addServerSocketMessagesListeners();
    }

    async fetchGameDataFromServer(pageId: number): Promise<void> {
        const routeToSend = '/games/' + pageId.toString();
        const numberOfGamesInAPage = 4;
        this.communicationService.get(routeToSend).subscribe({
            next: (response) => {
                if (response.body !== null) {
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

    onDeleteAllGames() {
        this.popUpElement.showDeleteGamesPopUp(true);
    }

    async deleteAllGames(isDeleteRequest: boolean): Promise<void> {
        if (isDeleteRequest) {
            const routeToSend = '/games/deleteAllGames';
            this.communicationService.delete(routeToSend).subscribe({
                next: (response) => {
                    if (response.body !== null) {
                        this.gamesNbr = 0;
                        location.reload();
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

    async goToNextSlide() {
        this.currentPageNbr++;
        if (this.currentPageNbr > 0) {
            this.showPreviousButton = true;
        }
        await this.fetchGameDataFromServer(this.currentPageNbr);
    }

    async goToPreviousSlide() {
        this.currentPageNbr--;
        if (this.currentPageNbr <= 0) {
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
                window.location.reload();
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
}
