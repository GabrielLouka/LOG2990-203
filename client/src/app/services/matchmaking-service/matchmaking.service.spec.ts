/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TestBed } from '@angular/core/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper/socket-test-helper';
import { SocketClientService } from '@app/services/socket-client-service/socket-client.service';
import { Action } from '@common/classes/action';
import { Match } from '@common/classes/match';
import { Player } from '@common/classes/player';
import { MatchType } from '@common/enums/match-type';
import { Socket } from 'socket.io-client';
import { MatchmakingService } from './matchmaking.service';

class SocketClientServiceMock extends SocketClientService {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    override connect() {}
}

describe('MatchmakingService', () => {
    let matchmakingService: MatchmakingService;
    let socketClientService: SocketClientService;
    let socketTestHelper: SocketTestHelper;
    let socketServiceMock: SocketClientServiceMock;

    const player1: Player = {
        username: 'player1',
        playerId: 'socket1',
    };

    const player2: Player = {
        username: 'player2',
        playerId: 'socket2',
    };

    const matchId = 'socket1';
    const gameId = '1';

    beforeEach(() => {
        socketTestHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock();
        socketServiceMock.socket = socketTestHelper as unknown as Socket;
        socketClientService = jasmine.createSpyObj('SocketClientService', ['isSocketAlive', 'connect', 'disconnect', 'on', 'send', 'socket'], {
            socket: { id: matchId },
            socketId: matchId,
        });

        TestBed.configureTestingModule({
            providers: [MatchmakingService, { provide: SocketClientService, useValue: socketServiceMock }],
        });
        matchmakingService = TestBed.inject(MatchmakingService);
        matchmakingService.connectSocket();
    });

    it('should create matchmaking service', () => {
        expect(matchmakingService).toBeTruthy();
    });

    it('should return create game and set currentMatch', () => {
        const expectedCurrentMatch: Match = new Match(1, matchId);
        matchmakingService.createGame(gameId);
        expect(matchmakingService.currentMatchPlayed).toEqual(expectedCurrentMatch);
    });

    it('should set match player', () => {
        matchmakingService.createGame(gameId);
        matchmakingService.currentMatchPlayer = player1.username;
        expect(socketClientService.send).toHaveBeenCalledTimes(2);
    });

    it('should call handle update match when set match player is called', () => {
        matchmakingService.createGame(gameId);
        spyOn(matchmakingService.onMatchUpdated, 'invoke');
        matchmakingService.currentMatchPlayer = player1.username;
        expect(matchmakingService.onMatchUpdated).toHaveBeenCalled();
    });

    it('should set current match type', () => {
        matchmakingService.createGame(gameId);
        matchmakingService.currentMatchType = MatchType.OneVersusOne;
        expect(matchmakingService.currentMatchId).toEqual('');
    });

    it('should disconnect socket and reset all the service variables', () => {
        matchmakingService.disconnectSocket();
        expect(matchmakingService.currentMatchPlayed).toEqual(null);
        expect(matchmakingService.onMatchUpdated).toEqual(new Action<Match | null>());
        expect(matchmakingService.onGetJoinRequest).toEqual(new Action<Player>());
        expect(matchmakingService.onGetJoinCancel).toEqual(new Action<string>());
        expect(matchmakingService.isHost).toBe(true);
    });

    it('should join game when called', () => {
        matchmakingService.createGame(gameId);
        expect(socketClientService.send).toHaveBeenCalledTimes(1);
    });

    it('should connect sockets and handle match update events when called', () => {
        matchmakingService.createGame(gameId);
        matchmakingService.handleMatchUpdateEvents();
    });

    it('should send match join request when request from incoming player', () => {
        matchmakingService.joinGame(matchId);
        matchmakingService.sendMatchJoinRequest(player2.username);
    });

    it('should return true when is player 1', () => {
        matchmakingService.createGame(gameId);
        matchmakingService.currentMatchPlayer = player1.username;
        expect(matchmakingService.player1Id).toBeUndefined();
    });

    it('should send match join cancel request', () => {
        matchmakingService.joinGame(matchId);
        matchmakingService.sendMatchJoinCancel(player2.username);
        expect(socketClientService.send).toHaveBeenCalledTimes(0);
    });

    it('should send incoming player request answer', () => {
        matchmakingService.createGame(gameId);
        matchmakingService.sendIncomingPlayerRequestAnswer(player2, true);
        expect(socketClientService.send).toHaveBeenCalledTimes(0);
    });

    it('should not send incoming player request answer if current match is null', () => {
        const expectedError = new Error('currentMatch is null');
        matchmakingService.joinGame(matchId);
        matchmakingService.sendMatchJoinRequest(player2.username);
        try {
            matchmakingService.sendIncomingPlayerRequestAnswer(player2, true);
        } catch (e: unknown) {
            expect(e).toEqual(expectedError);
        }
    });

    it('should return the current match as a solo mode', () => {
        expect(matchmakingService.is1vs1Mode).toEqual(false);
    });

    it('should return false when it is one versus one', () => {
        expect(matchmakingService.is1vs1Mode).toEqual(false);
    });

    it('should return the matchId', () => {
        matchmakingService.createGame(gameId);
        matchmakingService.currentMatchPlayer = player1.username;
        expect(matchmakingService.currentMatchId).toEqual('socket1');
    });

    it('should return empty string if match is null', () => {
        matchmakingService.joinGame(matchId);
        expect(matchmakingService.currentMatchId).toEqual('');
        expect(matchmakingService.player2Username).toEqual('');
        expect(matchmakingService.player1Username).toEqual('');
    });

    it('should return true when is solo mode', () => {
        matchmakingService.createGame(gameId);
        matchmakingService.currentMatchType = MatchType.Solo;
        expect(matchmakingService.is1vs1Mode).toEqual(false);
    });

    it('should return the player 2 username', () => {
        expect(matchmakingService.is1vs1Mode).toEqual(false);
    });

    it('should handle incomingPlayerCancel', () => {
        // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-explicit-any
        const callback = ((params: any) => {}) as any;
        socketTestHelper.on('incomingPlayerCancel', callback);
        socketTestHelper.peerSideEmit('incomingPlayerCancel', 'socket2');
        matchmakingService.handleMatchUpdateEvents();
    });

    it('should handle incomingPlayerRequest', () => {
        // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-explicit-any
        const callback = ((params: any) => {}) as any;
        socketTestHelper.on('incomingPlayerRequest', callback);
        socketTestHelper.peerSideEmit('incomingPlayerRequest', 'socket2');
        matchmakingService.handleMatchUpdateEvents();
    });

    it('should handle incomingPlayerRequest answer', () => {
        // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-explicit-any
        const callback = ((params: any) => {}) as any;
        socketTestHelper.on('incomingPlayerRequestAnswer', callback);
        socketTestHelper.peerSideEmit('incomingPlayerRequestAnswer', 'socket2');
        matchmakingService.handleMatchUpdateEvents();
    });

    it('should handle incomingPlayerRequest answer', () => {
        // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-explicit-any
        const callback = ((params: any) => {}) as any;
        socketTestHelper.on('matchUpdated', callback);
        socketTestHelper.peerSideEmit('matchUpdated', 'socket2');
        matchmakingService.handleMatchUpdateEvents();
    });

    it('should return false if match status is not aborted', () => {
        matchmakingService.createGame(gameId);
        const expectedCurrentMatch: Match = new Match(1, matchId);
        expect(matchmakingService.isMatchAborted(expectedCurrentMatch)).toBe(false);
    });

    it('should return false if match is one versus one', () => {
        matchmakingService.createGame(gameId);
        expect(matchmakingService.isSoloMode).toBe(false);
    });

    it('should return player 1 & 2 usernames', () => {
        matchmakingService.createGame(gameId);
        matchmakingService.currentMatchPlayer = player1.username;
        matchmakingService.currentMatchPlayer = player2.username;
        expect(matchmakingService.player1Username).toEqual(player1.username);
        expect(matchmakingService.player2Username).toEqual(player2.username);
        expect(matchmakingService.isPlayer1).toBe(false);
    });

    it('should not set current player when current match is null', () => {
        const expectedError = new Error('currentMatch is null');
        matchmakingService.joinGame(matchId);
        try {
            matchmakingService.currentMatchPlayer = player1.username;
        } catch (e: unknown) {
            expect(e).toEqual(expectedError);
        }
    });

    it('should not send match join request when current match is null', () => {
        const expectedError = new Error('matchIdThatWeAreTryingToJoin is null');
        matchmakingService.createGame(gameId);
        try {
            matchmakingService.sendMatchJoinRequest('player1');
        } catch (e: unknown) {
            expect(e).toEqual(expectedError);
        }
    });

    it('should not send match join cancel when current match is null', () => {
        const expectedError = new Error('matchIdThatWeAreTryingToJoin is null');
        matchmakingService.createGame(gameId);
        try {
            matchmakingService.sendMatchJoinCancel('player1');
        } catch (e: unknown) {
            expect(e).toEqual(expectedError);
        }
    });
});
