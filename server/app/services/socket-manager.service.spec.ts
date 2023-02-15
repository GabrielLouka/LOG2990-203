/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Server } from '@app/server';
import { GameData } from '@common/game-data';
import { defaultRankings } from '@common/ranking';
import { Vector2 } from '@common/vector2';
import { assert } from 'chai';
import * as sinon from 'sinon';
import { createSandbox, SinonSandbox, SinonStub, SinonStubbedInstance } from 'sinon';
// eslint-disable-next-line import/no-named-as-default
import Container from 'typedi';
import { MatchingDifferencesService } from './matching-differences.service';
import { SocketManager } from './socket-manager.service';

const RESPONSE_DELAY = 200;
describe('SocketManager', () => {
    let sandbox: SinonSandbox;
    let server: Server;
    let socketManager: SocketManager;
    let connectionStub: SinonStub;
    let emitStub: SinonStub;
    let matchingDifferencesServiceStub: SinonStubbedInstance<MatchingDifferencesService>;
    let roomEmitStub: SinonStub;

    beforeEach(async () => {
        sandbox = createSandbox();
        server = Container.get(Server);
        server.init();
        socketManager = server['socketManager'];
        connectionStub = sinon.stub(socketManager['sio'], 'on');
        emitStub = sinon.stub(socketManager['sio'].sockets, <any>'emit');
        matchingDifferencesServiceStub = sinon.createStubInstance(MatchingDifferencesService);
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

    it('should disconnect all sockets instances disconnect', (done) => {
        const spy = sinon.spy(socketManager['sio'].sockets, 'disconnectSockets');
        socketManager.disconnect();
        setTimeout(() => {
            assert(spy.called);
            spy.restore();
            done();
        }, RESPONSE_DELAY * 5); // 1 seconde
    });

    it('should call emitTime on socket configuration', (done) => {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const spy = sinon.spy(socketManager, <any>'emitTime');
        setTimeout(() => {
            assert(spy.called);
            done();
        }, RESPONSE_DELAY * 5); // 1 seconde
    });

    describe('handleSockets', () => {
        it('should print to console a connexion message', (done) => {
            socketManager.handleSockets();
            const spy = sinon.spy(console, 'log');
            const connectionCallback = connectionStub.getCall(0).args[1];
            const socket = {
                id: 'socket1',
                emit: sinon.stub(),
                on: sinon.stub(),
                rooms: new Set(['room1']),
            };
            connectionCallback(socket);
            // eslint-disable-next-line no-unused-expressions
            assert(spy.calledOnceWith(`Connexion par l'utilisateur avec id : ${socket.id}`));
            spy.restore();
            done();
        });

        it('should call "on" method with "connection" event and call "emit" with "hello" event and "Hello World!" message', (done) => {
            socketManager.handleSockets();
            const connectionCallback = connectionStub.getCall(0).args[1];
            const socket = {
                id: 'socket1',
                emit: sinon.stub(),
                on: sinon.stub(),
                rooms: new Set(['room1']),
            };

            connectionCallback(socket);

            // eslint-disable-next-line no-unused-expressions
            assert(socket.emit.calledOnceWith('hello', 'Hello World!'));
            done();
        });

        it('should print to console when socket sends message', (done) => {
            socketManager.handleSockets();
            const connectionCallback = connectionStub.getCall(0).args[1];
            const spy = sinon.spy(console, 'log');
            const socket = {
                id: 'socket1',
                emit: sinon.stub(),
                on: sinon.stub(),
                rooms: new Set(['room1']),
            };
            const testMessage = 'messageTest';

            connectionCallback(socket);
            const socketOnCallBack = socket.on.getCall(0).args[1];
            socketOnCallBack(testMessage);

            // eslint-disable-next-line no-unused-expressions
            assert(spy.calledWith(testMessage));
            spy.restore();
            done();
        });

        it('should launchGame', (done) => {
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
            const username = 'user1';
            socketManager.handleSockets();
            const connectionCallback = connectionStub.getCall(0).args[1];
            const socket = {
                id: 'socket1',
                emit: sinon.stub(),
                on: sinon.stub(),
                join: sinon.stub(),
                rooms: new Set(['room1']),
                data: sinon.stub().returns(false),
            };

            const testMessage = 'messageTest';

            connectionCallback(socket);
            socket.on.callsFake((event: string, cb) => {
                if (event === 'message') {
                    cb(testMessage);
                }
                if (event === 'launchGame') {
                    cb({ dataTest, username });
                }
            });
            setTimeout(() => {
                assert(socket.on.calledWith('message'));
                assert(socket.on.calledWith('launchGame'));
                done();
            }, RESPONSE_DELAY * 5); // 1 seconde
        });
    });

    it('should disconnect when disconnect is called and print reason', (done) => {
        socketManager.handleSockets();
        const spy = sinon.spy(console, 'log');
        const connectionCallback = connectionStub.getCall(0).args[1];
        const socket = {
            id: 'socket1',
            emit: sinon.stub(),
            on: sinon.stub(),
            join: sinon.stub(),
            rooms: new Set(),
            data: {},
        };
        connectionCallback(socket);

        const disconnectCallback = socket.on.getCall(6).args[1];
        const reason = 'Raison test';
        disconnectCallback(reason);
        setTimeout(() => {
            assert(socket.on.calledWith('disconnect'));
            assert(spy.calledWith(`Deconnexion par l'utilisateur avec id : ${socket.id}`));
            assert(spy.calledWith(`Raison de deconnexion : ${reason}`));
            spy.restore();
            done();
        }, RESPONSE_DELAY * 5); // 1 seconde
    });

    it('should broadcast message to all', (done) => {
        socketManager.handleSockets();
        const connectionCallback = connectionStub.getCall(0).args[1];
        const socket = {
            id: 'socket1',
            emit: sinon.stub(),
            on: sinon.stub(),
            join: sinon.stub(),
            rooms: new Set(),
            data: {},
        };
        connectionCallback(socket);

        const broadcastCallback = socket.on.getCall(3).args[1];
        const broadcastMessage = 'Broadcast test';
        broadcastCallback(broadcastMessage);
        setTimeout(() => {
            assert(socket.on.calledWith('broadcastAll'));
            assert(emitStub.calledWith('massMessage', `${socket.id} : ${broadcastMessage}`));
            done();
        }, RESPONSE_DELAY * 5); // 1 seconde
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
    it('should validate difference when one is found', (done) => {
        const spy = sinon.spy(console, 'log');
        const differencePosition: Vector2 = new Vector2(200, 100);
        matchingDifferencesServiceStub.getDifferenceIndex.withArgs(data, differencePosition).returns(0);
        socketManager.handleSockets();
        const connectionCallback = connectionStub.getCall(0).args[1];
        const socket = {
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
        connectionCallback(socket);
        const fakeEmit = sinon.fake();
        roomEmitStub.returns({ emit: fakeEmit });
        socket.rooms.has = sinon.stub().returns(true);
        const username = 'user1';
        const launchCallback = socket.on.getCall(1).args[1];
        launchCallback({ gameData: data, username });
        const validateCallback = socket.on.getCall(2).args[1];
        validateCallback({ foundDifferences: [false, false], position: differencePosition });
        setTimeout(() => {
            assert(socket.on.calledWith('launchGame'));
            assert(spy.calledWith('launchGame called with 0user1socket1'));
            assert(spy.calledWith('gameData saved for room: 0user1socket1'));
            assert(socket.on.calledWith('validateDifference'));
            assert(spy.calledWith('SUCCESSFULLY FOUND'));
            assert(spy.calledWith('Difference found at index #0'));
            roomEmitStub.reset();
            spy.restore();
            sinon.restore();
            done();
        }, RESPONSE_DELAY * 5); // 1 seconde
    });

    it('should not validate difference when not found', (done) => {
        const differencePosition: Vector2 = new Vector2(300, 200);
        matchingDifferencesServiceStub.getDifferenceIndex.withArgs(data, differencePosition).returns(-1);
        socketManager.handleSockets();
        const connectionCallback = connectionStub.getCall(0).args[1];
        const socket = {
            id: 'socket1',
            emit: sinon.stub(),
            on: sinon.stub(),
            join: sinon.stub(),
            rooms: new Set(),
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
        connectionCallback(socket);
        const fakeEmit = sinon.fake();
        roomEmitStub.returns({ emit: fakeEmit });
        socket.rooms.has = sinon.stub().returns(true);
        const validateCallback = socket.on.getCall(2).args[1];
        validateCallback({ foundDifferences: [false, false], position: differencePosition });
        setTimeout(() => {
            assert(socket.on.calledWith('validateDifference'));
            roomEmitStub.reset();
            sinon.restore();
            done();
        }, RESPONSE_DELAY * 5); // 1 seconde
    });

    it('should not join room if socket has not given room', (done) => {
        const spy = sinon.spy(console, 'log');
        socketManager.handleSockets();
        const connectionCallback = connectionStub.getCall(0).args[1];
        const socket = {
            id: 'socket1',
            emit: sinon.stub(),
            on: sinon.stub(),
            join: sinon.stub(),
            rooms: new Set<string>(['0user1socket1']),
            data: {},
        };
        connectionCallback(socket);
        socket.rooms.has = sinon.stub().returns(false);
        socket.data.hasOwnProperty = sinon.stub().returns(false);
        const username = 'user1';
        const launchCallback = socket.on.getCall(1).args[1];
        launchCallback({ gameData: data, username });
        setTimeout(() => {
            assert(socket.on.calledWith('launchGame'));
            assert(spy.calledWith('launchGame called with 0user1socket1'));
            assert(roomEmitStub.notCalled);
            roomEmitStub.reset();
            sinon.restore();
            spy.restore();
            done();
        }, RESPONSE_DELAY * 5); // 1 seconde
    });

    it('should join the given room', (done) => {
        socketManager.handleSockets();
        const connectionCallback = connectionStub.getCall(0).args[1];
        const socket = {
            id: 'socket1',
            emit: sinon.stub(),
            on: sinon.stub(),
            join: sinon.stub(),
            rooms: new Set<string>(['0user1socket1']),
            data: {},
        };
        const roomName = 'room 1';
        connectionCallback(socket);
        const joinRoomCallback = socket.on.getCall(4).args[1];
        joinRoomCallback(roomName);
        setTimeout(() => {
            assert(socket.on.calledWith('joinRoom'));
            assert(socket.join.calledWith(roomName));
            sinon.restore();
            done();
        }, RESPONSE_DELAY * 5); // 1 seconde
    });

    it('should emit a roomMessage only if socket has room', (done) => {
        socketManager.handleSockets();
        const connectionCallback = connectionStub.getCall(0).args[1];
        const socket = {
            id: 'socket1',
            emit: sinon.stub(),
            on: sinon.stub(),
            join: sinon.stub(),
            rooms: new Set(['room1']),
            data: {},
        };
        connectionCallback(socket);
        const roomMessage = 'Salut!';
        const joinRoomCallback = socket.on.getCall(5).args[1];
        socket.rooms.has = sinon.stub().returns(true);
        const fakeEmit = sinon.fake();
        roomEmitStub.returns({ emit: fakeEmit });
        joinRoomCallback(roomMessage);
        setTimeout(() => {
            assert(socket.on.calledWith('roomMessage'));
            assert(roomEmitStub.called);
            sinon.restore();
            done();
        }, RESPONSE_DELAY * 5); // 1 seconde
    });

    it('should not emit a roomMessage only if socket has not room', (done) => {
        socketManager.handleSockets();
        const connectionCallback = connectionStub.getCall(0).args[1];
        const socket = {
            id: 'socket1',
            emit: sinon.stub(),
            on: sinon.stub(),
            join: sinon.stub(),
            rooms: new Set(['room1']),
            data: {},
        };
        connectionCallback(socket);
        const roomMessage = 'Salut!';
        const joinRoomCallback = socket.on.getCall(5).args[1];
        socket.rooms.has = sinon.stub().returns(false);
        joinRoomCallback(roomMessage);
        setTimeout(() => {
            assert(socket.on.calledWith('roomMessage'));
            assert(roomEmitStub.notCalled);
            sinon.restore();
            done();
        }, RESPONSE_DELAY * 5); // 1 seconde
    });
});
