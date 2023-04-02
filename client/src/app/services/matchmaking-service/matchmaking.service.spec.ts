/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TestBed } from '@angular/core/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper/socket-test-helper';
import { SocketClientService } from '@app/services/socket-client-service/socket-client.service';
import { Action } from '@common/classes/action';
import { Match } from '@common/classes/match';
import { Player } from '@common/classes/player';
import { MatchStatus } from '@common/enums/match-status';
import { MatchType } from '@common/enums/match-type';
import { Socket } from 'socket.io-client';
import { MatchmakingService } from './matchmaking.service';

class SocketClientServiceMock extends SocketClientService {
    override get isSocketAlive() {
        return true;
    }
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
        socketServiceMock.send = jasmine.createSpy('send');
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
        const match: Match = new Match(1, '');
        matchmakingService.createGame(gameId);
        expect(matchmakingService.currentMatchPlayed).toEqual(match);
    });

    it('should disconnect socket if socket is alive', () => {
        matchmakingService.connectSocket();
    });

    it('should set match player', () => {
        const sendSocketSpy = (<jasmine.Spy>socketServiceMock.send).and.returnValue(Promise.resolve());
        matchmakingService.createGame(gameId);
        matchmakingService.currentMatchPlayer = player1.username;
        expect(sendSocketSpy).toHaveBeenCalledTimes(2);
    });

    it('should call handle update match when set match player is called', () => {
        const sendSocketSpy = (<jasmine.Spy>socketServiceMock.send).and.returnValue(Promise.resolve());
        matchmakingService.createGame(gameId);
        spyOn(matchmakingService.onMatchUpdated, 'invoke');
        matchmakingService.currentMatchPlayer = player1.username;
        expect(sendSocketSpy).toHaveBeenCalledTimes(2);
    });

    it('should set the given match to the current match', () => {
        const match: Match = {
            gameId: 1,
            matchId: 'socket1',
            player1,
            player2,
            matchStatus: MatchStatus.InProgress,
            matchType: MatchType.OneVersusOne,
        };
        matchmakingService.currentMatchGame = match;
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
        expect(matchmakingService.onAllGameDeleted).toEqual(new Action<string | null>());
        expect(matchmakingService.onSingleGameDeleted).toEqual(new Action<string | null>());
        expect(matchmakingService.isHost).toBe(true);
    });

    it('should join game when called', () => {
        (<jasmine.Spy>socketServiceMock.send).and.returnValue(Promise.resolve());
        matchmakingService.createGame(gameId);
        expect(<jasmine.Spy>socketServiceMock.send).toHaveBeenCalled();
    });

    it('should connect sockets and handle match update events when called', () => {
        matchmakingService.createGame(gameId);
        matchmakingService.handleMatchUpdateEvents();
    });

    it('should send match join request when request from incoming player', () => {
        matchmakingService.joinGame(matchId, gameId);
        matchmakingService.sendMatchJoinRequest(player2.username);
    });

    it('should return true when is player 1', () => {
        matchmakingService.createGame(gameId);
        matchmakingService.currentMatchPlayer = player1.username;
        expect(matchmakingService.player1Id).toBeUndefined();
    });

    it('should send match join cancel request', () => {
        const callback = ((params: any) => {}) as any;
        const sendSocketSpy = (<jasmine.Spy>socketServiceMock.send).and.returnValue(Promise.resolve());
        socketTestHelper.on('incomingPlayerCancel', callback);
        socketTestHelper.peerSideEmit('incomingPlayerCancel', 'socket2');
        matchmakingService.joinGame(matchId, gameId);
        matchmakingService.sendMatchJoinCancel(player2.username);
        matchmakingService.handleMatchUpdateEvents();
        expect(sendSocketSpy).toHaveBeenCalled();
        expect(socketClientService.send).not.toHaveBeenCalled();
    });

    it('should send incoming player request answer', () => {
        matchmakingService.createGame(gameId);
        const sendSocketSpy = (<jasmine.Spy>socketServiceMock.send).and.returnValue(Promise.resolve());
        matchmakingService.sendIncomingPlayerRequestAnswer(player2, true);
        matchmakingService.handleMatchUpdateEvents();
        expect(sendSocketSpy).toHaveBeenCalled();
    });

    it('should not send incoming player request answer if current match is null', () => {
        const expectedError = new Error('currentMatch is null');
        matchmakingService.joinGame(matchId, gameId);
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
        expect(matchmakingService.currentMatchId).toEqual('');
    });

    it('should return empty string if match is null', () => {
        matchmakingService.joinGame(matchId, gameId);
        expect(matchmakingService.currentMatchId).toEqual(undefined as any);
        expect(matchmakingService.player2Username).toEqual(undefined as any);
        expect(matchmakingService.player1Username).toEqual(undefined as any);
    });

    it('should return true when is solo mode', () => {
        matchmakingService.createGame(gameId);
        matchmakingService.setCurrentMatchType(MatchType.Solo);
        expect(matchmakingService.isOneVersusOne).toEqual(false);
    });

    it('should return the player 2 username', () => {
        expect(matchmakingService.isOneVersusOne).toEqual(false);
    });

    it('should handle when all games are deleted ', () => {
        const callback = ((params: any) => {}) as any;
        socketTestHelper.on('allGameDeleted', callback);
        socketTestHelper.peerSideEmit('deleteAllGames');
        matchmakingService.handleMatchUpdateEvents();
    });

    it('should handle update match ', () => {
        const callback = ((params: any) => {}) as any;
        socketTestHelper.on('matchUpdated', callback);
        socketTestHelper.peerSideEmit('matchUpdated', 'socket2');
        matchmakingService.handleMatchUpdateEvents();
    });

    it('should handle incoming Player Request', () => {
        const callback = ((params: any) => {}) as any;
        socketTestHelper.on('incomingPlayerRequest', callback);
        socketServiceMock.socket.send('requestToJoinMatch', player1);
        matchmakingService.handleMatchUpdateEvents();
    });

    it('should handle incomingPlayerRequest answer', () => {
        const data = { matchId: 'socket1', player: player1, isAccepted: true };
        const callback = ((params: any) => {}) as any;
        socketTestHelper.on('incomingPlayerRequestAnswer', callback);
        socketTestHelper.peerSideEmit('incomingPlayerRequestAnswer', data);
        matchmakingService.handleMatchUpdateEvents();
    });

    it('should handle when a game is deleted', () => {
        const data = { hasDeleteGame: true, id: '1' };
        const callback = ((params: any) => {}) as any;
        socketTestHelper.on('gameDeleted', callback);
        socketTestHelper.peerSideEmit('deletedGame', data);
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
        expect(matchmakingService.player1Username).toEqual(undefined as any);
        expect(matchmakingService.player2Username).toEqual(undefined as any);
        expect(matchmakingService.isPlayer1).toBe(false);
    });

    it('should not set current player when current match is null', () => {
        const expectedError = new Error('currentMatch is null');
        matchmakingService.joinGame(matchId, gameId);
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
