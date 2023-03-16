import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DeleteGamesPopUpComponent } from '@app/components/delete-games-pop-up/delete-games-pop-up.component';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { MatchmakingService } from '@app/services/matchmaking-service/matchmaking.service';
import { SocketClientService } from '@app/services/socket-client-service/socket-client.service';
import { MatchType } from '@common/match-type';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-overlay',
    templateUrl: './overlay.component.html',
    styleUrls: ['./overlay.component.scss'],
})
export class OverlayComponent {
    @Input() isPlayable: boolean;
    @Input() id: string;
    @Input() matchToJoinIfAvailable: string | null = null;
    @ViewChild('popUpElement') popUpElement: DeleteGamesPopUpComponent;
    debugDisplayMessage: BehaviorSubject<string> = new BehaviorSubject<string>('');
    constructor(
        private readonly matchmakingService: MatchmakingService,
        private readonly router: Router,
        private readonly socketService: SocketClientService,
        private readonly communicationService: CommunicationService,
    ) {}

    requestGameCreationToServer(matchType: MatchType) {
        this.matchmakingService.createGame(this.id);
        this.matchmakingService.setCurrentMatchType(matchType);
    }

    createOneVersusOneGame() {
        this.requestGameCreationToServer(MatchType.OneVersusOne);
        this.router.navigate(['/registration', this.id]);
    }

    createSoloGame() {
        this.requestGameCreationToServer(MatchType.Solo);
        this.router.navigate(['/registration', this.id]);
    }

    joinGame() {
        if (this.matchToJoinIfAvailable === null) return;
        this.matchmakingService.joinGame(this.matchToJoinIfAvailable);
        this.router.navigate(['/registration', this.id]);
    }
    showDeletePopUp() {
        this.popUpElement.showDeleteGamesPopUp(false);
    }
    async deleteSelectedGame(isDeleteRequest: boolean): Promise<void> {
        if (isDeleteRequest) {
            const routeToSend = '/games/' + this.id;
            this.communicationService.delete(routeToSend).subscribe({
                next: (response) => {
                    if (response.body) {
                        location.reload();
                    }
                },
                error: (err: HttpErrorResponse) => {
                    const responseString = `Server Error : ${err.message}`;
                    const serverResult = JSON.parse(err.error);
                    this.debugDisplayMessage.next(responseString + '\n' + serverResult.message);
                },
            });
            this.socketService.socket.emit('deletedGame', { hasDeletedGame: true, id: this.id });
        }
    }
}
