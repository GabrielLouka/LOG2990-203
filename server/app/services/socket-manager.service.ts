/* eslint-disable guard-for-in */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable no-console */
import { GameData } from '@common/game-data';
import { Vector2 } from '@common/vector2';
import * as http from 'http';
import * as io from 'socket.io';
import { MatchManagerService } from './match-manager.service';
import { MatchingDifferencesService } from './matching-differences.service';

export class SocketManager {
    matchingDifferencesService: MatchingDifferencesService;
    // matchManagerService: MatchManagerService;
    private sio: io.Server;
    private readonly room: 'serverRoom';
    constructor(server: http.Server, private matchManagerService: MatchManagerService) {
        this.sio = new io.Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
        this.matchingDifferencesService = new MatchingDifferencesService();
        // this.matchManagerService = new MatchManagerService();
    }

    handleSockets(): void {
        this.sio.on('connection', (socket) => {
            console.log(`Connexion par l'utilisateur avec id : ${socket.id}`);
            let joinedRoomName = '';

            socket.on('message', (message: string) => {
                console.log(message);
            });

            socket.on('launchGame', (data: { gameData: GameData; username: string }) => {
                joinedRoomName = data.gameData.id + data.username + socket.id;
                console.log('launchGame called with ' + joinedRoomName);
                socket.join(joinedRoomName);
                if (socket.rooms.has(joinedRoomName)) {
                    this.sio.to(joinedRoomName).emit('matchJoined', 'User:' + data.username + 'has joined the game with id #' + data.gameData.id);
                    socket.data = data;
                    for (const room of socket.rooms) {
                        console.log('gameData saved for room: ' + room);
                    }

                    for (const key in socket.data) {
                        console.log(`${key}: ${socket.data[key]}`);
                    }
                }
            });

            socket.on('validateDifference', (data: { foundDifferences: boolean[]; position: Vector2 }) => {
                const foundDifferenceId = this.matchingDifferencesService.getDifferenceIndex(
                    socket.data.gameData as GameData,
                    data.position as Vector2,
                );
                const successfullyFoundDifference = foundDifferenceId !== -1 && !data.foundDifferences[foundDifferenceId];

                if (successfullyFoundDifference) {
                    console.log('SUCCESSFULLY FOUND');
                    data.foundDifferences[foundDifferenceId] = true;
                    console.log('Difference found at index #' + foundDifferenceId);
                }
                this.sio.to(joinedRoomName).emit('validationReturned', {
                    foundDifferences: data.foundDifferences,
                    isValidated: successfullyFoundDifference,
                    foundDifferenceIndex: foundDifferenceId,
                });
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

            socket.on('createGame', (data) => {
                console.log('Creating game (id ' + data.gameId + ')');
                this.matchManagerService.createMatch(data.gameId, socket.id);
                this.sio.emit('gameProgressUpdate', {
                    gameId: data.gameId,
                    isGameInProgress: true,
                });
            });
        });
    }

    disconnect(): void {
        this.sio.disconnectSockets();
        this.sio.close();
    }
}
