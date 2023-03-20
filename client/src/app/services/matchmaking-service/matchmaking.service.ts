import { Injectable } from '@angular/core';
import { SocketClientService } from '@app/services/socket-client-service/socket-client.service';
import { Action } from '@common/action';
import { Match } from '@common/match';
import { MatchStatus } from '@common/match-status';
import { MatchType } from '@common/match-type';
import { Player } from '@common/player';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class MatchmakingService {
    sequence = new Observable<{ gameId: number; isGameInProgress: boolean }>();
    onMatchUpdated = new Action<Match | null>();
    onGetJoinRequest = new Action<Player>();
    onGetJoinCancel = new Action<string>();
    onGetJoinRequestAnswer = new Action<{ matchId: string; player: Player; isAccepted: boolean }>();
    matchIdThatWeAreTryingToJoin: string | null = null;
    private currentMatch: Match | null;

    constructor(private readonly socketService: SocketClientService) {}

    get currentMatchPlayed() {
        return this.currentMatch;
    }

    get currentMatchId(): string {
        return this.currentMatch?.matchId as string;
    }

    get currentSocketId() {
        return this.socketService.socketId;
    }

    get isHost(): boolean {
        return this.matchIdThatWeAreTryingToJoin == null;
    }

    get isPlayer1(): boolean {
        return this.socketService.socketId === this.player1Id;
    }

    get is1vs1Mode(): boolean {
        return this.currentMatch?.matchType === MatchType.OneVersusOne;
    }

    get isSoloMode(): boolean {
        return this.currentMatch?.matchType === MatchType.Solo;
    }

    get player1Username(): string {
        return this.currentMatch?.player1?.username as string;
    }

    get player2Username(): string {
        return this.currentMatch?.player2?.username as string;
    }

    get player1Id(): string | undefined {
        return this.currentMatch?.player1?.playerId;
    }

    set currentMatchType(matchType: MatchType) {
        const matchId = this.currentSocketId;

        this.socketService.send<{ matchId: string; matchType: MatchType }>('setMatchType', { matchId, matchType });
    }

    set currentMatchPlayer(playerName: string) {
        if (!this.currentMatch) throw new Error('currentMatch is null');

        const matchId = this.currentMatch.matchId;
        const player = new Player(playerName, this.currentSocketId.toString());

        this.socketService.send<{ matchId: string; player: Player }>('setMatchPlayer', {
            matchId,
            player,
        });
    }

    isMatchAborted(match: Match): boolean {
        return match.matchStatus === MatchStatus.Aborted;
    }

    connectSocket() {
        if (this.socketService.isSocketAlive) this.disconnectSocket();

        this.socketService.connect();
        this.handleMatchUpdateEvents();
    }

    handleMatchUpdateEvents() {
        this.socketService.on('matchUpdated', (data: Match) => {
            this.currentMatch = data;
            this.onMatchUpdated.invoke(this.currentMatch);
        });

        this.socketService.on('incomingPlayerRequest', (data: Player) => {
            this.onGetJoinRequest.invoke(data);
        });

        this.socketService.on('incomingPlayerCancel', (playerId: string) => {
            this.onGetJoinCancel.invoke(playerId);
        });

        this.socketService.on('incomingPlayerRequestAnswer', (data: { matchId: string; player: Player; isAccepted: boolean }) => {
            this.onGetJoinRequestAnswer.invoke(data);
        });
    }

    disconnectSocket() {
        this.socketService.disconnect();
        this.currentMatch = null;
        this.onMatchUpdated = new Action<Match | null>();
        this.onGetJoinRequest = new Action<Player>();
        this.onGetJoinCancel = new Action<string>();
        this.onGetJoinRequestAnswer = new Action<{ matchId: string; player: Player; isAccepted: boolean }>();
        this.matchIdThatWeAreTryingToJoin = null;
    }

    createGame(gameId: string) {
        this.socketService.send<{ gameId: string }>('createMatch', { gameId });
        this.currentMatch = new Match(parseInt(gameId, 10), this.currentSocketId.toString());
        this.matchIdThatWeAreTryingToJoin = null; // Host doesn't need to join
    }

    joinGame(matchId: string) {
        this.socketService.send<{ matchId: string }>('joinRoom', { matchId });
        this.matchIdThatWeAreTryingToJoin = matchId;
        this.currentMatch = null;
    }

    sendMatchJoinRequest(playerName: string) {
        if (!this.matchIdThatWeAreTryingToJoin) throw new Error('matchIdThatWeAreTryingToJoin is null');

        const matchId = this.matchIdThatWeAreTryingToJoin;
        const player = new Player(playerName, this.currentSocketId.toString());

        this.socketService.send<{ matchId: string; player: Player }>('requestToJoinMatch', {
            matchId,
            player,
        });
    }

    sendMatchJoinCancel(playerName: string) {
        if (!this.matchIdThatWeAreTryingToJoin) throw new Error('matchIdThatWeAreTryingToJoin is null');

        const matchId = this.matchIdThatWeAreTryingToJoin;
        const player = new Player(playerName, this.currentSocketId.toString());

        this.socketService.send<{ matchId: string; player: Player }>('cancelJoinMatch', {
            matchId,
            player,
        });
    }

    sendIncomingPlayerRequestAnswer(player: Player, isAccepted: boolean) {
        if (!this.currentMatch) throw new Error('currentMatch is null');

        const matchId = this.currentMatch.matchId;

        this.socketService.send<{ matchId: string; player: Player; isAccepted: boolean }>('sendIncomingPlayerRequestAnswer', {
            matchId,
            player,
            isAccepted,
        });
    }
}
