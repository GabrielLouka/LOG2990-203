/* eslint-disable no-console */
import { GameData } from '@common/game-data';
import { Vector2 } from '@common/vector2';
import * as http from 'http';
import * as io from 'socket.io';
import { MatchingDifferencesService } from './matching-differences.service';

export class SocketManager {
    matchingDifferencesService: MatchingDifferencesService;
    private sio: io.Server;
    private room: string = 'serverRoom';
    constructor(server: http.Server) {
        this.sio = new io.Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
        this.matchingDifferencesService = new MatchingDifferencesService();
    }

    handleSockets(): void {
        this.sio.on('connection', (socket) => {
            console.log(`Connexion par l'utilisateur avec id : ${socket.id}`);
            // message initial
            socket.emit('hello', 'Hello World!');

            socket.on('message', (message: string) => {
                console.log(message);
            });

            socket.on('launchGame', (data: { gameData: GameData; username: string }) => {
                console.log('launchGame called with ' + data.gameData.id + data.username);
                socket.join(data.gameData.id + data.username);
                if (socket.rooms.has(data.gameData.id + data.username)) {
                    this.sio
                        .to(data.gameData.id + data.username)
                        .emit('matchJoined', 'User:' + data.username + 'has joined the game with id #' + data.gameData.id);
                    socket.data = data;
                    for (const room of socket.rooms) {
                        console.log('gameData saved for room: ' + room);
                    }

                    for (const key in socket.data) {
                        // eslint-disable-next-line no-prototype-builtins
                        if (socket.data.hasOwnProperty(key)) {
                            console.log(`${key}: ${socket.data[key]}`);
                        }
                    }
                }
            });

            socket.on('validateDifference', (data: { foundDifferences: boolean[]; position: Vector2 }) => {
                const foundDifferenceId = this.matchingDifferencesService.getDifferenceIndex(socket.data.gameData as GameData, data.position);
                const successfullyFoundDifference = foundDifferenceId !== -1 && !data.foundDifferences[foundDifferenceId];

                if (successfullyFoundDifference) {
                    data.foundDifferences[foundDifferenceId] = true;
                    console.log('Difference found at index #' + foundDifferenceId);
                }

                this.sio.to(socket.data.gameData.id + socket.data.username).emit('validationReturned', {
                    foundDifferences: data.foundDifferences,
                    isValidated: successfullyFoundDifference,
                    foundDifferenceIndex: foundDifferenceId,
                });
            });
            socket.on('broadcastAll', (message: string) => {
                this.sio.sockets.emit('massMessage', `${socket.id} : ${message}`);
            });

            socket.on('joinRoom', (roomName: string) => {
                socket.join(roomName);
            });

            socket.on('roomMessage', (message: string) => {
                // Seulement un membre de la salle peut envoyer un message aux autres
                if (socket.rooms.has(this.room)) {
                    this.sio.to(this.room).emit('roomMessage', `${socket.id} : ${message}`);
                }
            });

            socket.on('disconnect', (reason) => {
                console.log(`Deconnexion par l'utilisateur avec id : ${socket.id}`);
                console.log(`Raison de deconnexion : ${reason}`);
            });
        });

        setInterval(() => {
            this.emitTime();
        }, 1000);
    }

    disconnect(): void {
        this.sio.disconnectSockets();
        this.sio.close();
    }

    private emitTime() {
        this.sio.sockets.emit('clock', new Date().toLocaleTimeString());
    }
}
