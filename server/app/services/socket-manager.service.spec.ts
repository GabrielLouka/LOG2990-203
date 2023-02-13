/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Server } from '@app/server';
import { GameData } from '@common/game-data';
import { defaultRankings } from '@common/ranking';
import { assert } from 'chai';
import * as sinon from 'sinon';
import { createSandbox, SinonSandbox } from 'sinon';
import Container from 'typedi';
import { SocketManager } from './socket-manager.service';

const RESPONSE_DELAY = 200;
describe('SocketManager', () => {
    let sandbox: SinonSandbox;
    let server: Server;
    let socketManager: SocketManager;

    let connectionStub: sinon.SinonStub;
    let emitStub: sinon.SinonStub;
    // let joinStub: sinon.SinonStub;
    // let disconnectStub: sinon.SinonStub;
    let roomEmitStub: sinon.SinonStub;
    // let dataStub: sinon.SinonStub;

    beforeEach(async () => {
        sandbox = createSandbox();
        server = Container.get(Server);
        server.init();
        socketManager = server['socketManager'];
        connectionStub = sinon.stub(socketManager['sio'], 'on');
        emitStub = sinon.stub(socketManager['sio'].sockets, 'emit');
        // joinStub = sinon.stub(socketManager['sio'].sockets, <any>'join');
        // disconnectStub = sinon.stub(socketManager['sio'].sockets, <any>'disconnect');
        roomEmitStub = sinon.stub(socketManager['sio'], 'to');
        // dataStub = sinon.stub(socketManager['sio'].sockets, <any>'data');
    });

    afterEach(() => {
        connectionStub.restore();
        emitStub.restore();
        // joinStub.restore();
        // disconnectStub.restore();
        roomEmitStub.restore();
        // dataStub.restore();
        sandbox.restore();
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
                // join: sinon.stub(),
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
            socketManager.handleSockets();
            const connectionCallback = connectionStub.getCall(0).args[1];
            // const spy = sinon.spy(console, 'log');
            const socket = {
                id: 'socket1',
                emit: sinon.stub(),
                on: sinon.stub(),
                join: sinon.stub(),
                rooms: {
                    has: sinon.stub().returns(true),
                    room: new Set(['room1']),
                },
                data: sinon.stub(),
            };

            const gameData: GameData = {
                id: 0,
                name: 'Jeu1',
                isEasy: true,
                nbrDifferences: 2,
                differences: [[{ x: 200, y: 100 }], [{ x: 100, y: 200 }]],
                ranking: defaultRankings,
            };
            const username = 'user1';
            const testMessage = 'messageTest';

            connectionCallback(socket);
            socket.on.callsFake((event: string, cb) => {
                if (event === 'message') {
                    cb(testMessage);
                }
                if (event === 'launchGame') {
                    cb({ gameData, username });
                }
            });
            setTimeout(() => {
                assert(socket.on.calledWith('message'));
                assert(socket.on.calledWith('launchGame'));
                done();
            }, RESPONSE_DELAY * 5); // 1 seconde
        });
    });

    // it('should join the room and send a matchJoined event when launchGame is called', (done) => {
    //     socketManager.handleSockets();
    //     const connectionCallback = connectionStub.getCall(0).args[1];
    //     const socket = {
    //         id: 'socket1',
    //         emit: sinon.stub(),
    //         on: sinon.stub(),
    //         join: sinon.stub(),
    //         rooms: new Set(),
    //         data: {},
    //     };
    //     connectionCallback(socket);

    //     const launchGameCallback = socket.on.getCall(1).args[1];
    //     const gameData: GameData = {
    //         id: 0,
    //         name: 'Jeu1',
    //         isEasy: true,
    //         nbrDifferences: 2,
    //         differences: [[{ x: 200, y: 100 }], [{ x: 100, y: 200 }]],
    //         ranking: defaultRankings,
    //     };
    //     const username = 'player1';
    //     socket.rooms.has = sinon.stub().returns(true);
    //     launchGameCallback({ gameData, username });

    //     setTimeout(() => {
    //         assert(emitStub.calledOnceWith('matchJoined', `User:${username} has joined the game with id #${gameData.id}`));
    //         assert.deepEqual(socket.data, { gameData, username });
    //         done();
    //     }, RESPONSE_DELAY * 5); // 1 seconde
    // });

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
});
