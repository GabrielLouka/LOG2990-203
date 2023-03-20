import { Injectable } from '@angular/core';
import { MatchManagerService } from '@app/services/match-manager-service/match-manager.service';
import { Player } from '@common/player';
import { CLEAN_USERNAME, WAITING_FOR_PLAYER_MESSAGE, WAITING_PLAYER_ANSWER_MESSAGE } from '@common/utils/env';

@Injectable({
    providedIn: 'root',
})
export class IncomingPlayerService {
    private waitingPlayers: Player[];
    private incomingPlayer: Player | null;
    private joiningStatusMessage: string;
    private hasFoundIncomingPlayer: boolean;

    constructor(private readonly matchManagerService: MatchManagerService) {
        this.joiningStatusMessage = 'Loading';
        this.incomingPlayer = null;
        this.waitingPlayers = [];
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

    get queueStatusToDisplay(): string {
        return this.joiningStatusMessage;
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
        return !isAccepted && this.matchManagerService.isHost && this.hasIncomingPlayer;
    }

    refreshQueueDisplay() {
        this.hasFoundIncomingPlayer = this.hasIncomingPlayer;
        if (this.hasFoundIncomingPlayer) {
            const startingGameMessage = 'Voulez-vous débuter la partie ';

            this.joiningStatusMessage = startingGameMessage + `avec ${this.firstIncomingPlayer.username.slice(0, CLEAN_USERNAME)}?\n`;
            this.joiningStatusMessage += ' | Joueur(s) en attente : ';

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
