import { Injectable } from '@angular/core';
import { Action } from '@common/action';
import { Match } from '@common/match';
import { MatchType } from '@common/match-type';
import { Player } from '@common/player';
import { Observable } from 'rxjs';
import { SocketClientService } from './socket-client.service';

@Injectable({
    providedIn: 'root',
})
export class MatchmakingService {
    sequence = new Observable<{ gameId: number; isGameInProgress: boolean }>();
    onMatchUpdated = new Action<Match | null>();
    onGetJoinRequest = new Action<Player>();
    onGetJoinRequestAnswer = new Action<{ matchId: string; player: Player; accept: boolean }>();
    // if this is null, it means we are not trying to join a match
    // instead, we are creating a new one
    matchIdThatWeAreTryingToJoin: string | null = null;
    private currentMatch: Match | null;

    constructor(private readonly socketService: SocketClientService) {}

    get isHost() {
        return this.matchIdThatWeAreTryingToJoin == null;
    }
    // Start a connection to the remote server
    connectSocket() {
        if (this.socketService.isSocketAlive()) this.disconnectSocket();

        this.socketService.connect();
        this.handleMatchmakingEvents();
    }

    handleMatchmakingEvents() {
        this.socketService.on('matchUpdated', (data: Match) => {
            this.currentMatch = data;
            this.onMatchUpdated.invoke(this.currentMatch);
        });
        this.socketService.on('incomingPlayerRequest', (data: Player) => {
            this.onGetJoinRequest.invoke(data);
        });
        this.socketService.on('incomingPlayerRequestAnswer', (data: { matchId: string; player: Player; accept: boolean }) => {
            this.onGetJoinRequestAnswer.invoke(data);
        });
    }

    disconnectSocket() {
        this.socketService.disconnect();
        this.currentMatch = null;
        this.onMatchUpdated = new Action<Match | null>();
    }

    getCurrentSocketId() {
        return this.socketService.getSocketId();
    }

    getCurrentMatch() {
        // eslint-disable-next-line no-console
        console.log('current match : ', this.currentMatch);
        return this.currentMatch;
    }

    createGame(gameId: string) {
        this.socketService.send<{ gameId: string }>('createMatch', { gameId });
        this.currentMatch = new Match(parseInt(gameId, 10), this.getCurrentSocketId().toString());
    }

    // this will ask the server to join a match but it will still be pending
    joinGame(matchId: string) {
        this.socketService.send<{ matchId: string }>('joinRoom', { matchId });
        this.matchIdThatWeAreTryingToJoin = matchId;
    }

    sendMatchJoinRequest(playerName: string) {
        if (this.matchIdThatWeAreTryingToJoin == null) throw new Error('matchIdThatWeAreTryingToJoin is null');

        const matchId = this.matchIdThatWeAreTryingToJoin;
        const player = new Player(playerName, this.getCurrentSocketId().toString());
        this.socketService.send<{ matchId: string; player: Player }>('requestToJoinMatch', {
            matchId,
            player,
        });
    }

    sendIncomingPlayerRequestAnswer(player: Player, accept: boolean) {
        if (this.currentMatch == null) throw new Error('currentMatch is null');
        const matchId = this.currentMatch.matchId;
        this.socketService.send<{ matchId: string; player: Player; accept: boolean }>('sendIncomingPlayerRequestAnswer', { matchId, player, accept });
    }

    setCurrentMatchType(matchType: MatchType) {
        const matchId = this.getCurrentSocketId();
        this.socketService.send<{ matchId: string; matchType: MatchType }>('setMatchType', { matchId, matchType });
    }

    setCurrentMatchPlayer(playerName: string) {
        if (this.currentMatch == null) throw new Error('currentMatch is null');

        const matchId = this.currentMatch.matchId;
        const player = new Player(playerName, this.getCurrentSocketId().toString());
        this.socketService.send<{ matchId: string; player: Player }>('setMatchPlayer', {
            matchId,
            player,
        });
    }
}
