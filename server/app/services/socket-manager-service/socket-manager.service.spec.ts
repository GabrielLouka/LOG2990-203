/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Server } from '@app/server';
import { GameData } from '@common/game-data';
import { Match } from '@common/match';
import { MatchStatus } from '@common/match-status';
import { MatchType } from '@common/match-type';
import { defaultRankings } from '@common/ranking';
import { Vector2 } from '@common/vector2';
import { assert, expect } from 'chai';
import * as sinon from 'sinon';
import { createSandbox, SinonSandbox, SinonStub, SinonStubbedInstance } from 'sinon';
// eslint-disable-next-line import/no-named-as-default
import { MatchManagerService } from '@app/services/match-manager-service/match-manager.service';
import { MatchingDifferencesService } from '@app/services/matching-difference-service/matching-differences.service';
import Container from 'typedi';
import { SocketManager } from './socket-manager.service';

const RESPONSE_DELAY = 200;
describe('SocketManager', () => {
    let sandbox: SinonSandbox;
    let server: Server;
    let socketManager: SocketManager;
    let connectionStub: SinonStub;
    let emitStub: SinonStub;
    let matchingDifferencesServiceStub: SinonStubbedInstance<MatchingDifferencesService>;
    let matchManagerServiceStub: SinonStubbedInstance<MatchManagerService>;
    let roomEmitStub: SinonStub;

    beforeEach(async () => {
        sandbox = createSandbox();
        server = Container.get(Server);
        server.init();
        socketManager = server['socketManager'];
        connectionStub = sinon.stub(socketManager['sio'], 'on');
        emitStub = sinon.stub(socketManager['sio'].sockets, <any>'emit');
        matchingDifferencesServiceStub = sinon.createStubInstance(MatchingDifferencesService);
        matchManagerServiceStub = sinon.createStubInstance(MatchManagerService);
        matchManagerServiceStub.getMatchById.resolves(match);
        matchManagerServiceStub.getMatchAvailableForGame.resolves(match.matchId);
        roomEmitStub = sinon.stub(socketManager['sio'], <any>'to');
    });

    afterEach(() => {
        connectionStub.restore();
        emitStub.restore();
        roomEmitStub.restore();
        sandbox.restore();
        socketManager.disconnect();
        socketManager['sio'].close();
        sinon.restore();
    });

    const matchPlayer = {
        username: 'player',
        playerId: 'socket1',
    };
    const match: Match = {
        gameId: 0,
        matchId: 'match1',
        player1: matchPlayer,
        player2: matchPlayer,
        matchType: MatchType.OneVersusOne,
        matchStatus: MatchStatus.InProgress,
    };
    const socket = {
        id: 'socket1',
        emit: sinon.stub(),
        on: sinon.stub(),
        join: sinon.stub(),
        to: sinon.stub(),
        rooms: new Set<string>(['match1']),
        data: {},
    };

    it('should disconnect all sockets instances disconnect', (done) => {
        const spy = sinon.spy(socketManager['sio'].sockets, 'disconnectSockets');
        socketManager.disconnect();
        setTimeout(() => {
            assert(spy.called);
            spy.restore();
            done();
        }, RESPONSE_DELAY * 5); // 1 seconde
    });

    describe('handleSockets', () => {
        it('should registerGameData and call update match', (done) => {
            const dataTest: GameData = {
                id: 0,
                name: 'Jeu1',
                isEasy: true,
                nbrDifferences: 2,
                differences: [
                    [
                        { x: 200, y: 100 },
                        { x: 100, y: 200 },
                    ],
                ],
                ranking: defaultRankings,
            };
            socketManager.handleSockets();
            matchManagerServiceStub.createMatch(match.gameId, match.matchId);
            const connectionCallback = connectionStub.getCall(0).args[1];
            connectionCallback(socket);
            const fakeEmit = sinon.fake();
            roomEmitStub.returns({ emit: fakeEmit });
            validateSocket.rooms.has = sinon.stub().returns(true);
            const registerCallback = socket.on.getCall(0).args[1];
            registerCallback(dataTest);
            setTimeout(() => {
                assert(socket.on.calledWith('registerGameData'));
                expect(socket.data).to.deep.equal(dataTest);
                done();
            }, RESPONSE_DELAY); // 1 seconde
        });
    });
    const data: GameData = {
        id: 0,
        name: 'Jeu1',
        isEasy: true,
        nbrDifferences: 2,
        differences: [
            [
                { x: 200, y: 100 },
                { x: 100, y: 200 },
            ],
        ],
        ranking: defaultRankings,
    };
    const validateSocket = {
        id: 'socket1',
        emit: sinon.stub(),
        on: sinon.stub(),
        join: sinon.stub(),
        rooms: new Set<string>(['0user1socket1']),
        data: {
            gameData: {
                id: 0,
                name: 'Jeu1',
                isEasy: true,
                nbrDifferences: 2,
                differences: [
                    [
                        { x: 200, y: 100 },
                        { x: 100, y: 200 },
                    ],
                ],
                ranking: defaultRankings,
            },
        },
    };
    it('should validate difference when one is found', (done) => {
        const differencePosition: Vector2 = new Vector2(200, 100);
        matchingDifferencesServiceStub.getDifferenceIndex.withArgs(data, differencePosition).returns(0);
        socketManager.handleSockets();
        const connectionCallback = connectionStub.getCall(0).args[1];
        connectionCallback(validateSocket);
        const fakeEmit = sinon.fake();
        roomEmitStub.returns({ emit: fakeEmit });
        validateSocket.rooms.has = sinon.stub().returns(true);

        const validateCallback = validateSocket.on.getCall(1).args[1];
        validateCallback({ foundDifferences: [false, false], position: differencePosition, isPlayer1: true });
        setTimeout(() => {
            assert(validateSocket.on.calledWith('validateDifference'));
            assert(roomEmitStub.called);
            roomEmitStub.restore();
            sinon.restore();
            done();
        }, RESPONSE_DELAY * 5); // 1 seconde
    });
    it('should not validate difference when not found', (done) => {
        const differencePosition: Vector2 = new Vector2(300, 200);
        matchingDifferencesServiceStub.getDifferenceIndex.withArgs(data, differencePosition).returns(-1);
        socketManager.handleSockets();
        const connectionCallback = connectionStub.getCall(0).args[1];
        connectionCallback(validateSocket);
        const fakeEmit = sinon.fake();
        roomEmitStub.returns({ emit: fakeEmit });
        validateSocket.rooms.has = sinon.stub().returns(true);
        const validateCallback = validateSocket.on.getCall(2).args[1];
        validateCallback({ foundDifferences: [false, false], position: differencePosition });
        setTimeout(() => {
            assert(validateSocket.on.calledWith('validateDifference'));
            roomEmitStub.restore();
            sinon.restore();
            done();
        }, RESPONSE_DELAY * 5); // 1 seconde
    });

    // TODO
    it('should remove player from match when disconnect is called', (done) => {
        socketManager.handleSockets();
        const connectionCallback = connectionStub.getCall(0).args[1];
        connectionCallback(socket);
        const fakeEmit = sinon.fake();
        roomEmitStub.returns({ emit: fakeEmit });
        socket.rooms.has = sinon.stub().returns(true);
        const disconnectCallback = socket.on.getCall(2).args[1];
        matchManagerServiceStub.removePlayerFromMatch.withArgs('socket1').returns('match1');
        disconnectCallback();
        setTimeout(() => {
            assert(socket.on.calledWith('disconnect'));
            done();
        }, RESPONSE_DELAY * 5); // 1 seconde
    });

    it('should createMatch with matchId and call joinMatchRoom', (done) => {
        socketManager.handleSockets();
        const connectionCallback = connectionStub.getCall(0).args[1];
        connectionCallback(socket);
        const createMatchCallback = socket.on.getCall(3).args[1];
        createMatchCallback({ gameId: match.gameId, matchId: match.matchId });
        setTimeout(() => {
            assert(socket.on.calledWith('createMatch'));
            assert(socket.join.called);
            done();
        }, RESPONSE_DELAY * 5); // 1 seconde
    });

    it('should set match type', (done) => {
        matchManagerServiceStub.getMatchById.resolves(match);
        socketManager.handleSockets();
        const connectionCallback = connectionStub.getCall(0).args[1];
        connectionCallback(socket);
        const setMatchTypeCallback = socket.on.getCall(4).args[1];
        setMatchTypeCallback({ matchId: match.matchId, matchType: MatchType.OneVersusOne });
        setTimeout(() => {
            assert(socket.on.calledWith('setMatchType'));
            done();
        }, RESPONSE_DELAY * 5); // 1 seconde
    });

    it('should set match player', (done) => {
        socketManager.handleSockets();
        const connectionCallback = connectionStub.getCall(0).args[1];
        connectionCallback(socket);
        const setMatchPlayerCallback = socket.on.getCall(5).args[1];
        setMatchPlayerCallback({ matchId: match.matchId, player: matchPlayer });
        setTimeout(() => {
            assert(socket.on.calledWith('setMatchPlayer'));
            done();
        }, RESPONSE_DELAY * 5); // 1 seconde
    });

    it('should join match room', (done) => {
        socketManager.handleSockets();
        const connectionCallback = connectionStub.getCall(0).args[1];
        connectionCallback(socket);
        const joinCallback = socket.on.getCall(6).args[1];
        joinCallback({ matchId: match.matchId });
        setTimeout(() => {
            assert(socket.on.calledWith('joinRoom'));
            done();
        }, RESPONSE_DELAY * 5); // 1 seconde
    });

    it('should request to join a match', (done) => {
        socketManager.handleSockets();
        const connectionCallback = connectionStub.getCall(0).args[1];
        connectionCallback(socket);
        socket.rooms.has = sinon.stub().returns(true);
        const fakeEmit = sinon.fake();
        socket.to.returns({ emit: fakeEmit });
        const joinCallback = socket.on.getCall(7).args[1];
        joinCallback({ matchId: match.matchId, player: matchPlayer });
        setTimeout(() => {
            assert(socket.on.calledWith('requestToJoinMatch'));
            assert(socket.to.called);
            done();
        }, RESPONSE_DELAY * 5); // 1 seconde
    });

    it('should cancel join match', (done) => {
        socketManager.handleSockets();
        const connectionCallback = connectionStub.getCall(0).args[1];
        connectionCallback(socket);
        socket.rooms.has = sinon.stub().returns(true);
        const fakeEmit = sinon.fake();
        socket.to.returns({ emit: fakeEmit });
        const joinCallback = socket.on.getCall(8).args[1];
        joinCallback({ matchId: match.matchId, player: matchPlayer });
        setTimeout(() => {
            assert(socket.on.calledWith('cancelJoinMatch'));
            done();
        }, RESPONSE_DELAY * 5); // 1 seconde
    });

    it('should send request answer to incoming player', (done) => {
        socketManager.handleSockets();
        const connectionCallback = connectionStub.getCall(0).args[1];
        connectionCallback(socket);
        socket.rooms.has = sinon.stub().returns(true);
        const fakeEmit = sinon.fake();
        socket.to.returns({ emit: fakeEmit });
        const joinCallback = socket.on.getCall(9).args[1];
        joinCallback({ matchId: match.matchId, player: matchPlayer, accept: true });
        setTimeout(() => {
            assert(socket.on.calledWith('sendIncomingPlayerRequestAnswer'));
            done();
        }, RESPONSE_DELAY * 5); // 1 seconde
    });

    it('should delete game', (done) => {
        socketManager.handleSockets();
        const connectionCallback = connectionStub.getCall(0).args[1];
        connectionCallback(socket);
        const joinCallback = socket.on.getCall(10).args[1];
        joinCallback({ gameDeleted: true, gameId: match.gameId });
        setTimeout(() => {
            assert(socket.on.calledWith('deletedGame'));
            done();
        }, RESPONSE_DELAY * 5); // 1 seconde
    });

    it('should delete all games', (done) => {
        socketManager.handleSockets();
        const connectionCallback = connectionStub.getCall(0).args[1];
        connectionCallback(socket);
        const joinCallback = socket.on.getCall(11).args[1];
        joinCallback({ hasDeletedAllGames: true });
        setTimeout(() => {
            assert(socket.on.calledWith('deleteAllGame'));
            done();
        }, RESPONSE_DELAY * 5); // 1 seconde
    });

    it('should send a message in the chat', (done) => {
        socketManager.handleSockets();
        const connectionCallback = connectionStub.getCall(0).args[1];
        connectionCallback(socket);
        const fakeEmit = sinon.fake();
        roomEmitStub.returns({ emit: fakeEmit });
        socket.rooms.has = sinon.stub().returns(true);
        const joinCallback = socket.on.getCall(12).args[1];
        joinCallback({ username: 'player1', message: 'salut', sentByPlayer1: true });
        setTimeout(() => {
            assert(socket.on.calledWith('sendingMessage'));
            done();
        }, RESPONSE_DELAY * 5); // 1 seconde
    });
});