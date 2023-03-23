import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DeleteGamesPopUpComponent } from '@app/components/delete-games-pop-up/delete-games-pop-up.component';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { MatchmakingService } from '@app/services/matchmaking-service/matchmaking.service';
import { SocketClientService } from '@app/services/socket-client-service/socket-client.service';
import { MatchType } from '@common/enums/match-type';
import { REGISTRATION_PATH } from '@common/utils/env.http';

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
    // eslint-disable-next-line max-params
    constructor(
        private readonly matchmakingService: MatchmakingService,
        private readonly router: Router,
        private readonly socketService: SocketClientService,
        private readonly communicationService: CommunicationService,
    ) {}

    requestGameCreationToServer(matchType: MatchType) {
        this.matchmakingService.createGame(this.id);
        this.matchmakingService.currentMatchType = matchType;
    }

    createOneVersusOneGame() {
        this.requestGameCreationToServer(MatchType.OneVersusOne);
        this.router.navigate([REGISTRATION_PATH, this.id]);
    }

    createSoloGame() {
        this.requestGameCreationToServer(MatchType.Solo);
        this.router.navigate([REGISTRATION_PATH, this.id]);
    }

    joinGame() {
        if (!this.matchToJoinIfAvailable) return;
        this.matchmakingService.joinGame(this.matchToJoinIfAvailable, this.id);
        this.router.navigate([REGISTRATION_PATH, this.id]);
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
                        this.reloadPage();
                    }
                },
                error: (err: HttpErrorResponse) => {
                    const responseString = `Server Error : ${err.message}\n`;
                    const serverResult = JSON.parse(err.error);
                    alert(responseString + serverResult);
                },
            });
            this.socketService.socket.emit('deletedGame', { hasDeletedGame: true, id: this.id });
        }
    }
    reloadPage() {
        window.location.reload();
    }
}
