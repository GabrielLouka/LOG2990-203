/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { GameData } from '@common/game-data';
import { defaultRankings } from '@common/ranking';
import { Vector2 } from '@common/vector2';
import { Server } from 'app/server';
import { assert, expect } from 'chai';
import * as sinon from 'sinon';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { io as ioClient, Socket } from 'socket.io-client';
import { Container } from 'typedi';
import { MatchingDifferencesService } from './matching-differences.service';
import { SocketManager } from './socket-manager.service';

const RESPONSE_DELAY = 200;
describe('SocketManager service tests,', () => {
    let service: SocketManager;
    let server: Server;
    let clientSocket: Socket;

    let matchingDifferenceService: SinonStubbedInstance<MatchingDifferencesService>;

    const urlString = 'http://localhost:3000';
    beforeEach(async () => {
        server = Container.get(Server);
        server.init();
        service = server['socketManager'];
        clientSocket = ioClient(urlString);

        matchingDifferenceService = createStubInstance(MatchingDifferencesService);
        matchingDifferenceService.getDifferenceIndex.resolves({
            i: 0,
        });
    });

    afterEach(() => {
        clientSocket.close();
        service['sio'].close();
        sinon.restore();
    });

    it('should handle a message event print it to console', (done) => {
        const spy = sinon.spy(console, 'log');
        const testMessage = 'Hello World';
        clientSocket.emit('message', testMessage);
        setTimeout(() => {
            assert(spy.called);
            assert(spy.calledWith(testMessage));
            done();
        }, RESPONSE_DELAY);
    });

    const gameData: GameData = {
        id: 0,
        name: 'Jeu1',
        isEasy: true,
        nbrDifferences: 2,
        differences: [[{ x: 200, y: 100 }], [{ x: 100, y: 200 }]],
        ranking: defaultRankings,
    };
    const username = 'MismatchMaster';
    const data = { gameData, username };
    it('launchGame event should print to console a message', (done) => {
        const spy = sinon.spy(console, 'log');
        clientSocket.emit('launchGame', data);

        setTimeout(() => {
            assert(spy.called);
            done();
        }, RESPONSE_DELAY);
    });

    it('launchGame event should emit gameData info to room with to(room).emit(msg)', (done) => {
        const spy = sinon.spy(service['sio'], 'to');
        clientSocket.emit('launchGame', data);

        setTimeout(() => {
            assert(spy.called);
            done();
        }, RESPONSE_DELAY);
    });

    it('should receive message if socket in room', (done) => {
        const testMessage = 'Hello World';
        const clientSocket2 = ioClient(urlString);
        clientSocket.emit('launchGame', data);
        clientSocket2.emit('joinRoom', clientSocket.id);
        clientSocket.emit('roomMessage', testMessage);

        setTimeout(() => {
            clientSocket2.on('roomMessage', (message: string) => {
                expect(message).to.contain(testMessage);
            });
            done();
        }, RESPONSE_DELAY * 5); // 1 seconde
    });

    it('should not receive message if socket not in room', (done) => {
        const testMessage = 'Hello World';
        const clientSocket2 = ioClient(urlString);
        clientSocket.emit('launchGame', data);
        clientSocket.emit('roomMessage', testMessage);

        setTimeout(() => {
            clientSocket2.on('roomMessage', (message: string) => {
                expect(message).not.to.contain(testMessage);
            });
            done();
        }, RESPONSE_DELAY * 5); // 1 seconde
    });

    it('should broadcast message to multiple clients on broadcastAll event', (done) => {
        const clientSocket2 = ioClient(urlString);
        const testMessage = 'Hello World';
        const spy = sinon.spy(service['sio'].sockets, 'emit');
        clientSocket.emit('broadcastAll', testMessage);

        clientSocket2.on('massMessage', (message: string) => {
            expect(message).to.contain(testMessage);
            assert(spy.called);
            done();
        });
    });

    it('should call emitTime on socket configuration', (done) => {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const spy = sinon.spy(service, <any>'emitTime');
        setTimeout(() => {
            assert(spy.called);
            done();
        }, RESPONSE_DELAY * 5); // 1 seconde
    });

    it('should disconnect all sockets instances disconnect', () => {
        const spy = sinon.spy(service['sio'].sockets, 'disconnectSockets');
        service.disconnect();
        assert(spy.called);
    });

    it('should validate if when difference found with console message', (done) => {
        const spy = sinon.spy(console, 'log');
        const foundDifferences = [true, false];
        const position: Vector2 = { x: 100, y: 200 };
        clientSocket.emit('launchGame', data);
        clientSocket.emit('validateDifference', { foundDifferences, position });
        setTimeout(() => {
            assert(spy.called);
            expect(foundDifferences).to.equal([true, true]);
            done();
        }, RESPONSE_DELAY);
    });

    it('should not print console message when no difference found', (done) => {
        const spy = sinon.spy(console, 'log');
        const foundDifferences: boolean[] = [true, false];
        const position: Vector2 = { x: 400, y: 400 };
        clientSocket.emit('launchGame', data);
        clientSocket.emit('validateDifference', { foundDifferences, position });
        setTimeout(() => {
            assert(spy.notCalled);
            expect(foundDifferences).to.equal([true, false]);
            done();
        }, RESPONSE_DELAY);
    });
});
