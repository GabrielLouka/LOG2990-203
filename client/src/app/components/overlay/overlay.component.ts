import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DeleteGamesPopUpComponent } from '@app/components/delete-games-pop-up/delete-games-pop-up.component';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { MatchManagerService } from '@app/services/match-manager-service/match-manager.service';
import { SocketClientService } from '@app/services/socket-client-service/socket-client.service';
import { MatchType } from '@common/match-type';

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
        private readonly matchManagerService: MatchManagerService,
        private readonly router: Router,
        private readonly socketService: SocketClientService,
        private readonly communicationService: CommunicationService,
    ) {}

    requestGameCreationToServer(matchType: MatchType) {
        this.matchManagerService.createGame(this.id);
        this.matchManagerService.currentMatchType = matchType;
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
        if (!this.matchToJoinIfAvailable) return;
        this.matchManagerService.joinGame(this.matchToJoinIfAvailable);
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
                    const responseString = `Server Error : ${err.message}\n`;
                    const serverResult = JSON.parse(err.error);
                    alert(responseString + serverResult);
                },
            });
            this.socketService.socket.emit('deletedGame', { hasDeletedGame: true, id: this.id });
        }
    }
}
