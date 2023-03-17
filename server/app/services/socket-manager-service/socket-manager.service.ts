import { MatchManagerService } from '@app/services/match-manager-service/match-manager.service';
import { MatchingDifferencesService } from '@app/services/matching-difference-service/matching-differences.service';
import { GameData } from '@common/game-data';
import { MatchType } from '@common/match-type';
import { Player } from '@common/player';
import { NOT_FOUND } from '@common/utils/env';
import { Vector2 } from '@common/vector2';
import * as http from 'http';
import * as io from 'socket.io';

export class SocketManager {
    matchingDifferencesService: MatchingDifferencesService;
    private sio: io.Server;
    constructor(server: http.Server, private matchManagerService: MatchManagerService) {
        this.sio = new io.Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
        this.matchingDifferencesService = new MatchingDifferencesService();
    }

    handleSockets(): void {
        this.sio.on('connection', (socket) => {
            let joinedRoomName = '';

            socket.on('registerGameData', (data: { gameData: GameData }) => {
                socket.data = data;
                sendMatchUpdate({ matchId: joinedRoomName });
            });

            socket.on('validateDifference', (data: { foundDifferences: boolean[]; position: Vector2; isPlayer1: boolean }) => {
                const foundDifferenceId = this.matchingDifferencesService.getDifferenceIndex(
                    socket.data.gameData as GameData,
                    data.position as Vector2,
                );
                const successfullyFoundDifference = foundDifferenceId !== NOT_FOUND && !data.foundDifferences[foundDifferenceId];

                if (successfullyFoundDifference) {
                    data.foundDifferences[foundDifferenceId] = true;
                }
                this.sio.to(joinedRoomName).emit('validationReturned', {
                    foundDifferences: data.foundDifferences,
                    isValidated: successfullyFoundDifference,
                    foundDifferenceIndex: foundDifferenceId,
                    isPlayer1: data.isPlayer1,
                });
            });

            socket.on('disconnect', () => {
                const matchThatWasAffected = this.matchManagerService.removePlayerFromMatch(socket.id);
                if (matchThatWasAffected) {
                    sendMatchUpdate({ matchId: matchThatWasAffected });
                    sendGameMatchProgressUpdate(matchThatWasAffected);
                }
                this.matchManagerService.currentMatches.forEach((match) => {
                    sendJoinMatchCancel(match.matchId, socket.id);
                });
            });

            socket.on('createMatch', (data) => {
                const newMatchId = this.matchManagerService.createMatch(data.gameId, socket.id).matchId;
                joinMatchRoom({ matchId: newMatchId });
            });

            socket.on('setMatchType', (data: { matchId: string; matchType: MatchType }) => {
                this.matchManagerService.setMatchType(data.matchId, data.matchType);

                sendMatchUpdate({ matchId: data.matchId });
            });

            socket.on('setMatchPlayer', (data: { matchId: string; player: Player }) => {
                this.matchManagerService.setMatchPlayer(data.matchId, data.player);

                sendMatchUpdate({ matchId: data.matchId });
                sendGameMatchProgressUpdate(data.matchId);
            });

            socket.on('joinRoom', (data: { matchId: string }) => {
                joinMatchRoom(data);
            });

            socket.on('requestToJoinMatch', (data: { matchId: string; player: Player }) => {
                socket.to(data.matchId).emit('incomingPlayerRequest', data.player); // send the request to the host
            });

            socket.on('cancelJoinMatch', (data: { matchId: string; player: Player }) => {
                sendJoinMatchCancel(data.matchId, data.player.playerId);
            });

            socket.on('sendIncomingPlayerRequestAnswer', (data: { matchId: string; player: Player; accept: boolean }) => {
                if (data.accept) {
                    this.matchManagerService.setMatchPlayer(data.matchId, data.player);
                    sendGameMatchProgressUpdate(data.matchId);
                }
                this.sio.to(data.matchId).emit('incomingPlayerRequestAnswer', data);
            });
            socket.on('deleteAllGames', (data) => {
                this.sio.emit('allGameDeleted', { noGameLeft: data.deletedGames }, socket.id);
                this.sio.emit('actionOnGameReloadingThePage');
            });
            socket.on('deletedGame', (data) => {
                this.sio.emit('gameDeleted', { gameDeleted: data.gameToDelete, id: data.id }, socket.id);
                this.sio.emit('actionOnGameReloadingThePage');
            });
            socket.on('sendingMessage', (data) => {
                this.sio
                    .to(joinedRoomName)
                    .emit('messageBetweenPlayers', { username: data.username, message: data.msg, sentByPlayer1: data.sentByPlayer1 });
            });

            const joinMatchRoom = (data: { matchId: string }) => {
                joinedRoomName = data.matchId;
                socket.join(joinedRoomName);
                if (socket.rooms.has(joinedRoomName)) {
                    this.sio.to(joinedRoomName).emit('matchJoined', 'User:' + socket.id + 'has joined the match');
                }
            };

            const sendJoinMatchCancel = (matchId: string, playerId: string) => {
                socket.to(matchId).emit('incomingPlayerCancel', playerId);
            };

            const sendMatchUpdate = (data: { matchId: string }) => {
                this.sio.to(data.matchId).emit('matchUpdated', this.matchManagerService.getMatchById(data.matchId));
            };

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
