import { Component, Input } from '@angular/core';
import { MatchmakingService } from '@app/services/matchmaking.service';

@Component({
    selector: 'app-overlay',
    templateUrl: './overlay.component.html',
    styleUrls: ['./overlay.component.scss'],
})
export class OverlayComponent {
    @Input() isPlayable: boolean;
    @Input() id: string;
    @Input() isGameInProgress: boolean;

    constructor(private readonly matchmakingService: MatchmakingService) {}

    createGame() {
        this.matchmakingService.createGame(this.id);
        window.alert('Lets connect to game id ' + this.id);
    }
}
