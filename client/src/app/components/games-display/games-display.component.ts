import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { CommunicationService } from '@app/services/communication.service';
import { MatchmakingService } from '@app/services/matchmaking.service';
import { SocketClientService } from '@app/services/socket-client.service';
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
    debugDisplayMessage: BehaviorSubject<string> = new BehaviorSubject<string>('');
    currentPageNbr: number = 0;
    games: {
        gameData: GameData;
        originalImage: Buffer;
        isGameInProgress: boolean;
    }[];
    title: string;
    gamesNbr: number = 0;
    justifyContent: string;
    showNextButton = true;

    showPreviousButton = false;
    constructor(
        private readonly communicationService: CommunicationService,
        private readonly matchmakingService: MatchmakingService,
        private readonly socketService: SocketClientService,
        private router: Router,
    ) {}
    ngOnInit() {
        this.title = this.isSelection ? 'Page de configuration' : 'Page de selection';
        this.justifyContent = this.isSelection ? 'center' : 'right';
        this.fetchGameDataFromServer(this.currentPageNbr);
        this.matchmakingService.connectSocket();
        this.addServerSocketMessagesListeners();
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.matchmakingService.disconnectSocket();
            }
        });
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
        this.socketService.on('gameProgressUpdate', (data: { gameId: number; isGameInProgress: boolean }) => {
            // eslint-disable-next-line no-console
            console.log('Receiving game progress update ' + data.gameId + ' | ' + data.isGameInProgress);
            this.updateGameAvailability(data.gameId, data.isGameInProgress);
        });
    }

    updateGameAvailability(gameId: number, isGameInProgress: boolean) {
        for (const game of this.games) {
            // i convert the id to a string because otherwise the comparison doesn't work
            // ...why?
            if (game.gameData.id.toString() === gameId.toString()) {
                game.isGameInProgress = isGameInProgress;
                break;
            }
        }
    }
}
