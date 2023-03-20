import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SocketClientService } from '@app/services/socket-client-service/socket-client.service';
import { CLASSIC_PATH, HOME_PATH } from '@common/utils/env.http';

@Injectable({
    providedIn: 'root',
})
export class RegistrationService {
    constructor(private readonly socketService: SocketClientService, private readonly router: Router) {}

    loadGamePage(id: string | null) {
        this.router.navigate([CLASSIC_PATH, id]);
    }

    redirectToMainPage() {
        this.router.navigate([HOME_PATH]);
    }

    signalRedirection() {
        this.socketService.on('allGameDeleted', () => {
            const pathSegments = window.location.href.split('/');
            const lastSegment = pathSegments[pathSegments.length - 2];
            if (lastSegment === 'registration') {
                this.router.navigate([HOME_PATH]).then(() => {
                    alert("Le jeu a été supprimé, vous avez donc été redirigé à l'accueil");
                });
            }
        });
    }

    signalRedirectionOneGame() {
        this.socketService.on('gameDeleted', (data: { hasDeletedGame: boolean; id: string }) => {
            const pathSegments = window.location.href.split('/');
            const pageName = pathSegments[pathSegments.length - 2];
            const idPage = pathSegments[pathSegments.length - 1];
            if (pageName === 'registration' && data.id === idPage) {
                this.router.navigate([HOME_PATH]).then(() => {
                    alert("Le jeu a été supprimé, vous avez donc été redirigé à l'accueil");
                });
            }
        });
    }
}
