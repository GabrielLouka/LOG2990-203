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
    let socketClientService: jasmine.SpyObj<SocketClientService>;
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

    // const match: Match = {
    //     gameId: 1,
    //     matchId: 'match1',
    //     player1,
    //     player2,
    //     matchType: MatchType.OneVersusOne,
    //     matchStatus: MatchStatus.InProgress,
    // };

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
            providers: [MatchmakingService, { provide: SocketClientService, useValue: socketClientService }],
        });
        matchmakingService = TestBed.inject(MatchmakingService);
        matchmakingService.createGame(gameId);
    });

    afterEach(() => {
        socketClientService.disconnect();
        socketServiceMock.disconnect();
    });

    it('should create matchmaking service', () => {
        expect(matchmakingService).toBeTruthy();
    });

    it('should return create game and set currentMatch', () => {
        const expectedCurrentMatch: Match = new Match(1, matchId);
        expect(matchmakingService.currentMatchPlayed).toEqual(expectedCurrentMatch);
    });

    it('should set match player', () => {
        const expectedMatch: Match = new Match(1, matchId);
        matchmakingService.currentMatchPlayer = player1.username;
        expect(socketClientService.send).toHaveBeenCalledTimes(2);
        expect(matchmakingService.currentMatchPlayed).toEqual(expectedMatch);
        expect(matchmakingService.currentMatchPlayed?.player1?.playerId).toEqual(player1.playerId);
    });

    it('should call handle update match when set match player is called', () => {
        spyOn(matchmakingService.onMatchUpdated, 'invoke');
        matchmakingService.currentMatchPlayer = player1.username;
        expect(socketClientService.on).toHaveBeenCalled();
    });

    it('should set current match type', () => {
        matchmakingService.currentMatchType = MatchType.OneVersusOne;
        expect(socketClientService.send).toHaveBeenCalledTimes(2);
        expect(matchmakingService.currentMatchId).toEqual(matchId);
        expect(matchmakingService.player1Id).toEqual(player1.playerId);
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
        matchmakingService.joinGame(matchId);
        expect(socketClientService.send).toHaveBeenCalledTimes(2);
    });

    it('should connect sockets and handle match update events when called', () => {
        matchmakingService.handleMatchUpdateEvents();
    });

    it('should send match join request when request from incoming player', () => {
        matchmakingService.joinGame(matchId);
        matchmakingService.sendMatchJoinRequest(player2.username);
        expect(socketClientService.send).toHaveBeenCalledTimes(3);
    });

    it('should return true when is player 1', () => {
        matchmakingService.joinGame(matchId);
        matchmakingService.currentMatchPlayer = player1.username;
        matchmakingService.sendMatchJoinRequest(player2.username);
        expect(matchmakingService.player1Id).toBeDefined();
    });

    it('should send match join cancel request', () => {
        matchmakingService.joinGame(matchId);
        matchmakingService.sendMatchJoinRequest(player2.username);
        matchmakingService.sendMatchJoinCancel(player2.username);
        expect(socketClientService.send).toHaveBeenCalledTimes(4);
    });

    it('should send incoming player request answer', () => {
        const expectedError = new Error('currentMatch is null');
        matchmakingService.joinGame(matchId);
        matchmakingService.sendMatchJoinRequest(player2.username);
        try {
            matchmakingService.sendIncomingPlayerRequestAnswer(player2, true);
        } catch (e: unknown) {
            expect(e).toEqual(expectedError);
        }
        expect(socketClientService.send).toHaveBeenCalledTimes(3);
    });
});
