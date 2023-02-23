import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { MatchmakingService } from '@app/services/matchmaking.service';
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

    constructor(private readonly matchmakingService: MatchmakingService, private readonly router: Router) {}

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
}
