import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MatchmakingService } from '@app/services/matchmaking-service/matchmaking.service';
import { CLASSIC_PATH, HOME_PATH } from '@common/utils/env.http';

@Injectable({
    providedIn: 'root',
})
export class RegistrationService {
    constructor(private readonly router: Router, private readonly matchmakingService: MatchmakingService) {}

    loadGamePage(id: string | null) {
        this.router.navigate([CLASSIC_PATH, id]);
    }

    redirectToMainPage() {
        this.router.navigate([HOME_PATH]);
    }

    handleGameDeleted(gameIdThatWasDeleted: string | null) {
        if (
            !gameIdThatWasDeleted ||
            (this.matchmakingService.currentMatch && gameIdThatWasDeleted === this.matchmakingService.currentMatch.gameId.toString()) ||
            this.matchmakingService.gameIdThatWeAreTryingToJoin === gameIdThatWasDeleted
        )
            this.router.navigate([HOME_PATH]).then(() => {
                alert("Le jeu a été supprimé, vous avez donc été redirigé à l'accueil");
            });
    }
}
