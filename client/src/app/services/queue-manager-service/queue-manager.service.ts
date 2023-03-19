import { Injectable } from '@angular/core';
import { MatchManagerService } from '@app/services/match-manager-service/match-manager.service';
import { Player } from '@common/player';
import { CLEAN_USERNAME, WAITING_FOR_PLAYER_MESSAGE, WAITING_PLAYER_ANSWER_MESSAGE } from '@common/utils/env';

@Injectable({
    providedIn: 'root',
})
export class QueueManagerService {
    private waitingPlayers: Player[];
    private incomingPlayer: Player | null;
    private queueStatusMessage: string;
    private hasFoundIncomingPlayer: boolean;

    constructor(private readonly matchManagerService: MatchManagerService) {
        this.queueStatusMessage = 'Loading';
        this.incomingPlayer = null;
        this.waitingPlayers = [];
        this.handleIncomingPlayerJoinRequest = this.handleIncomingPlayerJoinRequest.bind(this);
        this.handleIncomingPlayerJoinCancel = this.handleIncomingPlayerJoinCancel.bind(this);
    }

    get playersInQueue(): Player[] {
        return this.waitingPlayers;
    }

    get nbrOfPlayersInQueue(): number {
        return this.playersInQueue.length;
    }

    get isEmptyQueue() {
        return this.waitingPlayers.length === 0;
    }

    get hasIncomingPlayer(): boolean {
        return this.nbrOfPlayersInQueue >= 1;
    }

    get firstPlayerInQueue(): Player {
        return this.waitingPlayers[0];
    }

    get queueStatusToDisplay(): string {
        return this.queueStatusMessage;
    }

    get hasFound(): boolean {
        return this.hasFoundIncomingPlayer;
    }

    isIncomingPlayer(player: Player): boolean {
        return player.playerId === this.matchManagerService.currentSocketId;
    }

    isAcceptedByHost(isAccepted: boolean, player: Player): boolean {
        return isAccepted && this.isIncomingPlayer(player);
    }

    isRejectedByHost(isAccepted: boolean, player: Player): boolean {
        return !isAccepted && this.isIncomingPlayer(player);
    }

    isHostAcceptingIncomingPlayer(isAccepted: boolean): boolean {
        return isAccepted && this.matchManagerService.isHost;
    }

    isHostRejectingIncomingPlayer(isAccepted: boolean): boolean {
        return !isAccepted && this.matchManagerService.isHost && this.waitingPlayers.length >= 1;
    }

    refreshQueueDisplay() {
        this.hasFoundIncomingPlayer = this.hasIncomingPlayer;
        if (this.hasFoundIncomingPlayer) {
            const startingGameMessage = 'Voulez-vous débuter la partie ';

            this.queueStatusMessage = startingGameMessage + `avec ${this.firstPlayerInQueue.username.slice(0, CLEAN_USERNAME)}?\n`;
            this.queueStatusMessage += ' | Joueur(s) en attente : ';

            for (const player of this.waitingPlayers) {
                this.queueStatusMessage += ` ${player.username} \n ,`;
            }

            this.incomingPlayer = this.firstPlayerInQueue;
        } else {
            this.updateWaitingForIncomingPlayerMessage();
            this.incomingPlayer = null;
        }
    }

    updateWaitingForIncomingPlayerMessage() {
        this.queueStatusMessage = WAITING_FOR_PLAYER_MESSAGE;
    }

    updateWaitingForIncomingPlayerAnswerMessage() {
        this.queueStatusMessage = WAITING_PLAYER_ANSWER_MESSAGE;
    }

    handleIncomingPlayerJoinRequest(playerThatWantsToJoin: Player) {
        if (!this.matchManagerService.isHost) return;

        if (!this.waitingPlayers.includes(playerThatWantsToJoin)) {
            this.waitingPlayers.push(playerThatWantsToJoin);
        }

        this.refreshQueueDisplay();
    }

    handleIncomingPlayerJoinCancel(playerIdThatCancelledTheirJoinRequest: string) {
        if (!this.matchManagerService.isHost) return;

        this.waitingPlayers = this.waitingPlayers.filter((player) => player.playerId !== playerIdThatCancelledTheirJoinRequest);
        this.refreshQueueDisplay();
    }

    handleHostRejectingIncomingPlayer() {
        this.updateWaitingForIncomingPlayerMessage();
        this.hasFoundIncomingPlayer = false;
        this.waitingPlayers.shift();
    }

    acceptIncomingPlayer() {
        if (!this.incomingPlayer) return;

        this.matchManagerService.sendIncomingPlayerRequestAnswer(this.incomingPlayer, true);

        for (const player of this.waitingPlayers) {
            if (player !== this.incomingPlayer) {
                this.matchManagerService.sendIncomingPlayerRequestAnswer(player, false);
            }
        }
        this.waitingPlayers = [this.incomingPlayer];
    }

    refuseIncomingPlayer() {
        if (!this.incomingPlayer) return;

        this.matchManagerService.sendIncomingPlayerRequestAnswer(this.incomingPlayer, false);
    }
}
