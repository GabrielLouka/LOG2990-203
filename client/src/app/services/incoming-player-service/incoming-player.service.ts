import { Injectable } from '@angular/core';
import { MatchmakingService } from '@app/services/matchmaking-service/matchmaking.service';
import { Player } from '@common/player';
import { WAITING_FOR_PLAYER_MESSAGE, WAITING_PLAYER_ANSWER_MESSAGE } from '@common/utils/env';

@Injectable({
    providedIn: 'root',
})
export class IncomingPlayerService {
    private waitingPlayers: Player[] = [];
    private incomingPlayer: Player | null = null;
    private joiningStatusMessage: string;
    private hasFoundIncomingPlayer: boolean;

    constructor(private readonly matchmakingService: MatchmakingService) {
        this.handleIncomingPlayerJoinRequest = this.handleIncomingPlayerJoinRequest.bind(this);
        this.handleIncomingPlayerJoinCancel = this.handleIncomingPlayerJoinCancel.bind(this);
    }

    get incomingPlayers(): Player[] {
        return this.waitingPlayers;
    }

    get numberOfIncomingPlayers(): number {
        return this.waitingPlayers.length;
    }

    get hasIncomingPlayer(): boolean {
        return this.numberOfIncomingPlayers > 0;
    }

    get firstIncomingPlayer(): Player {
        return this.waitingPlayers[0];
    }

    get statusToDisplay(): string {
        return this.joiningStatusMessage;
    }

    get hasFoundOpponent(): boolean {
        return this.hasFoundIncomingPlayer;
    }

    isIncomingPlayer(player: Player): boolean {
        return player.playerId === this.matchmakingService.currentSocketId;
    }

    isAcceptedByHost(isAccepted: boolean, player: Player): boolean {
        return isAccepted && this.isIncomingPlayer(player);
    }

    isRejectedByHost(isAccepted: boolean, player: Player): boolean {
        return !isAccepted && this.isIncomingPlayer(player);
    }

    isHostAcceptingIncomingPlayer(isAccepted: boolean): boolean {
        return isAccepted && this.matchmakingService.isHost;
    }

    isHostRejectingIncomingPlayer(isAccepted: boolean): boolean {
        return !isAccepted && this.matchmakingService.isHost && this.hasIncomingPlayer;
    }

    refreshQueueDisplay() {
        this.hasFoundIncomingPlayer = this.hasIncomingPlayer;
        if (this.hasFoundIncomingPlayer) {
            const startingGameMessage = 'Voulez-vous débuter la partie ';

            this.joiningStatusMessage = startingGameMessage + `avec ${this.firstIncomingPlayer.username}\n`;

            for (const player of this.waitingPlayers) {
                this.joiningStatusMessage += ` ${player.username} \n ,`;
            }

            this.incomingPlayer = this.firstIncomingPlayer;
        } else {
            this.updateWaitingForIncomingPlayerMessage();
            this.incomingPlayer = null;
        }
    }

    updateWaitingForIncomingPlayerMessage() {
        this.joiningStatusMessage = WAITING_FOR_PLAYER_MESSAGE;
    }

    updateWaitingForIncomingPlayerAnswerMessage() {
        this.joiningStatusMessage = WAITING_PLAYER_ANSWER_MESSAGE;
    }

    handleIncomingPlayerJoinRequest(playerThatWantsToJoin: Player) {
        if (!this.matchmakingService.isHost) return;

        if (!this.waitingPlayers.includes(playerThatWantsToJoin)) {
            this.waitingPlayers.push(playerThatWantsToJoin);
        }

        this.refreshQueueDisplay();
    }

    handleIncomingPlayerJoinCancel(playerIdThatCancelledTheirJoinRequest: string) {
        if (!this.matchmakingService.isHost) return;

        this.waitingPlayers = this.waitingPlayers.filter((player) => player.playerId !== playerIdThatCancelledTheirJoinRequest);
        this.refreshQueueDisplay();
    }

    handleHostRejectingIncomingPlayer() {
        this.updateWaitingForIncomingPlayerMessage();
        this.hasFoundIncomingPlayer = false;
        this.waitingPlayers = this.waitingPlayers.splice(1, this.numberOfIncomingPlayers);
    }

    acceptIncomingPlayer() {
        if (!this.incomingPlayer) return;

        this.matchmakingService.sendIncomingPlayerRequestAnswer(this.incomingPlayer, true);

        for (const player of this.waitingPlayers) {
            if (player !== this.incomingPlayer) {
                this.matchmakingService.sendIncomingPlayerRequestAnswer(player, false);
            }
        }
        this.waitingPlayers = [this.incomingPlayer];
    }

    refuseIncomingPlayer() {
        if (!this.incomingPlayer) return;

        this.matchmakingService.sendIncomingPlayerRequestAnswer(this.incomingPlayer, false);
    }
}
