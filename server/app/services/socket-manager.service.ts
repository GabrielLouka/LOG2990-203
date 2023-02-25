/* eslint-disable guard-for-in */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable no-console */
import { GameData } from '@common/game-data';
import { MatchType } from '@common/match-type';
import { Player } from '@common/player';
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

            socket.on('registerGameData', (data: { gameData: GameData }) => {
                socket.data = data;
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

            socket.on('roomMessage', (message: string) => {
                // Seulement un membre de la salle peut envoyer un message aux autres
                if (socket.rooms.has(this.room)) {
                    this.sio.to(this.room).emit('roomMessage', `${socket.id} : ${message}`);
                }
            });

            socket.on('disconnect', (reason) => {
                console.log(`Deconnexion par l'utilisateur avec id : ${socket.id}`);
                console.log(`Raison de deconnexion : ${reason}`);

                // remove the player from the match they were in
                const matchThatWasAffected = this.matchManagerService.removePlayerFromMatch(socket.id);
                if (matchThatWasAffected) {
                    sendMatchUpdate({ matchId: matchThatWasAffected });
                    sendGameMatchProgressUpdate(matchThatWasAffected);
                }
            });

            // Matchmaking sockets
            socket.on('createMatch', (data) => {
                console.log('Creating game (id ' + data.gameId + ')');
                const newMatchId = this.matchManagerService.createMatch(data.gameId, socket.id).matchId;
                joinMatchRoom({ matchId: newMatchId });
            });

            // User requests to set the current match type
            socket.on('setMatchType', (data: { matchId: string; matchType: MatchType }) => {
                this.matchManagerService.setMatchType(data.matchId, data.matchType);

                sendMatchUpdate({ matchId: data.matchId });
            });

            socket.on('setMatchPlayer', (data: { matchId: string; player: Player }) => {
                console.log('trying to set player ' + data.player.username + ' to match ' + data.matchId);
                this.matchManagerService.setMatchPlayer(data.matchId, data.player);

                sendMatchUpdate({ matchId: data.matchId });
                sendGameMatchProgressUpdate(data.matchId);
            });

            // this will simply connect the sockets to the match room
            // but will not set the player (the host needs to accept the player first)
            // we do this so that the actual join request can be sent to the correct room
            socket.on('joinRoom', (data: { matchId: string }) => {
                joinMatchRoom(data);
            });

            socket.on('requestToJoinMatch', (data: { matchId: string; player: Player }) => {
                socket.to(data.matchId).emit('incomingPlayerRequest', data.player); // send the request to the host
            });

            socket.on('sendIncomingPlayerRequestAnswer', (data: { matchId: string; player: Player; accept: boolean }) => {
                if (data.accept) {
                    console.log('accepted player request for ' + data.player.username + ' in match ' + data.matchId);
                    this.matchManagerService.setMatchPlayer(data.matchId, data.player);
                    sendGameMatchProgressUpdate(data.matchId);
                }
                console.log('sending request answer to ' + data.matchId + ' for player ' + data.player.username + ' : ' + data.accept);
                this.sio.to(data.matchId).emit('incomingPlayerRequestAnswer', data);
            });

            const joinMatchRoom = (data: { matchId: string }) => {
                joinedRoomName = data.matchId;
                socket.join(joinedRoomName);
                if (socket.rooms.has(joinedRoomName)) {
                    this.sio.to(joinedRoomName).emit('matchJoined', 'User:' + socket.id + 'has joined the match');
                }
            };

            const sendMatchUpdate = (data: { matchId: string }) => {
                this.sio.to(data.matchId).emit('matchUpdated', this.matchManagerService.getMatchById(data.matchId));
            };

            // this will send information about which matches can be joined or if a new match needs to be created
            const sendGameMatchProgressUpdate = (matchId: string) => {
                const match = this.matchManagerService.getMatchById(matchId);
                if (match === undefined || match == null) return;
                const matchToJoinIfAvailable = this.matchManagerService.getMatchAvailableForGame(match.gameId);
                this.sio.emit('gameProgressUpdate', {
                    gameId: match.gameId,
                    matchToJoinIfAvailable,
                });
            };
        });
    }

    disconnect(): void {
        this.sio.disconnectSockets();
        this.sio.close();
    }
}
