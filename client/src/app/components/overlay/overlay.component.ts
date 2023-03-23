import { Component, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DeleteGamesPopUpComponent } from '@app/components/delete-games-pop-up/delete-games-pop-up.component';
import { GamesService } from '@app/services/games-service/games.service';
import { MatchmakingService } from '@app/services/matchmaking-service/matchmaking.service';
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

    constructor(
        private readonly matchmakingService: MatchmakingService,
        private readonly router: Router,
        private readonly gamesService: GamesService,
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
        this.matchmakingService.joinGame(this.matchToJoinIfAvailable);
        this.router.navigate([REGISTRATION_PATH, this.id]);
    }

    showDeletePopUp() {
        this.popUpElement.showDeleteGamesPopUp(false);
    }

    async deleteSelectedGame(isDeleteRequest: boolean): Promise<void> {
        this.gamesService.deleteSelectedGame(isDeleteRequest, this.id);
    }

    reloadPage() {
        window.location.reload();
    }
}
