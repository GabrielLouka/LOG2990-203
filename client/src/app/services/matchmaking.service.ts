import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SocketClientService } from './socket-client.service';

@Injectable({
    providedIn: 'root',
})
export class MatchmakingService {
    sequence = new Observable<{ gameId: number; isGameInProgress: boolean }>();

    constructor(private readonly socketService: SocketClientService) {}

    // Start a connection to the remote server
    connectSocket() {
        if (this.socketService.isSocketAlive()) this.socketService.disconnect();

        this.socketService.connect();
    }

    disconnectSocket() {
        this.socketService.disconnect();
    }

    createGame(gameId: string) {
        this.socketService.send<{ gameId: string }>('createGame', { gameId });
    }
}
