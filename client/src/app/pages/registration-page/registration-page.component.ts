import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@app/services/auth.service';
import { MatchmakingService } from '@app/services/matchmaking.service';
import { Match } from '@common/match';
import { MatchType } from '@common/match-type';
import { Player } from '@common/player';

@Component({
    selector: 'app-registration-page',
    templateUrl: './registration-page.component.html',
    styleUrls: ['./registration-page.component.scss'],
})
export class RegistrationPageComponent implements OnInit, OnDestroy {
    username: string | null | undefined;
    id: string | null;
    // used to determine if we should display the username field in the page
    usernameRegistered: boolean;
    waitingMessage: string = 'Loading';
    incomingPlayerFound: boolean;
    incomingPlayer: Player | null = null;
    hasSentJoinRequest: boolean = false;

    waitingPlayers: Player[] = [];
    registrationForm = new FormGroup({
        username: new FormControl('', Validators.compose([Validators.required, Validators.pattern('^[a-zA-Z0-9]{3,15}$')])),
    });

    constructor(
        private auth: AuthService,
        private route: ActivatedRoute,
        private readonly router: Router,
        private readonly matchmakingService: MatchmakingService,
    ) {}

    ngOnInit(): void {
        this.id = this.route.snapshot.paramMap.get('id');
        this.matchmakingService.onGetJoinRequest.add(this.handleIncomingPlayerJoinRequest.bind(this));
        this.matchmakingService.onGetJoinCancel.add(this.handleIncomingPlayerJoinCancel.bind(this));
        this.matchmakingService.onGetJoinRequestAnswer.add(this.handleIncomingPlayerJoinRequestAnswer.bind(this));
        this.matchmakingService.onMatchUpdated.add(this.handleMatchUpdated.bind(this));
    }

    ngOnDestroy(): void {
        if (this.username && this.hasSentJoinRequest) this.matchmakingService.sendMatchJoinCancel(this.username);
    }

    registerUser() {
        this.auth.registerUser(this.registrationForm.value.username as string);
        this.username = this.registrationForm.value.username;
        this.usernameRegistered = true;

        if (this.matchmakingService.getCurrentMatch() != null) {
            if (this.username) this.matchmakingService.setCurrentMatchPlayer(this.username);
            else window.alert('Username to register is not valid !');
            if (this.matchmakingService.getCurrentMatch()?.matchType === MatchType.Solo) {
                this.loadGamePage();
            } else {
                this.waitingMessage = 'Waiting for an opponent...';
            }
        } else {
            this.sendMatchJoinRequest();
        }
    }

    loadGamePage() {
        this.router.navigate(['/classic', this.id]);
    }

    sendMatchJoinRequest() {
        this.hasSentJoinRequest = true;
        this.waitingMessage = 'Waiting for the opponent to accept...';
        if (this.username) this.matchmakingService.sendMatchJoinRequest(this.username);
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

        // eslint-disable-next-line no-console
        console.log('Player ', playerIdThatCancelledTheirJoinRequest, ' cancelled their join request');

        // remove the player from the waiting players list because they cancelled their join request
        this.waitingPlayers = this.waitingPlayers.filter((player) => player.playerId !== playerIdThatCancelledTheirJoinRequest);

        this.refreshQueueDisplay();
    }

    refreshQueueDisplay() {
        this.incomingPlayerFound = this.waitingPlayers.length >= 1;
        if (this.incomingPlayerFound) {
            this.waitingMessage = `Do you want to play with ${this.waitingPlayers[0].username}?\n`;
            this.waitingMessage += ' | Players in queue: ';
            for (const player of this.waitingPlayers) {
                this.waitingMessage += `${player.username} \n ,`;
            }

            this.incomingPlayer = this.waitingPlayers[0];
        } else {
            this.waitingMessage = 'Waiting for an opponent...';
            this.incomingPlayer = null;
        }
    }

    handleIncomingPlayerJoinRequestAnswer(data: { matchId: string; player: Player; accept: boolean }) {
        // if you've been accepted by the host
        if (data.accept && data.player.playerId === this.matchmakingService.getCurrentSocketId()) {
            this.loadGamePage();
        }

        // if you are the host himself and you've accepted the player
        if (data.accept && this.matchmakingService.isHost) {
            this.loadGamePage();
        }

        // if you are the host and you've rejected the player
        if (!data.accept && this.matchmakingService.isHost && this.waitingPlayers.length >= 1) {
            this.waitingMessage = 'Waiting for an opponent...';
            this.incomingPlayerFound = false;
            this.waitingPlayers = this.waitingPlayers.splice(1, this.waitingPlayers.length);
            if (this.waitingPlayers.length >= 1) {
                this.handleIncomingPlayerJoinRequest(this.waitingPlayers[0]);
            }
        }

        // if you are the player and you've been rejected
        if (!data.accept && data.player.playerId === this.matchmakingService.getCurrentSocketId()) {
            this.router.navigate(['/']);
        }
    }

    handleMatchUpdated(match: Match | null) {
        if (match == null) return;

        // eslint-disable-next-line no-console
        console.log('Match updated ! ', match);
    }

    acceptIncomingPlayer() {
        if (this.incomingPlayer == null) return;
        this.matchmakingService.sendIncomingPlayerRequestAnswer(this.incomingPlayer, true);
        for (const player of this.waitingPlayers) {
            if (player !== this.incomingPlayer) {
                this.matchmakingService.sendIncomingPlayerRequestAnswer(player, false);
            }
        }
        this.waitingPlayers = [this.incomingPlayer];
    }

    refuseIncomingPlayer() {
        if (this.incomingPlayer == null) return;
        this.matchmakingService.sendIncomingPlayerRequestAnswer(this.incomingPlayer, false);

        // this.waitingPlayers = [];
        // this.incomingPlayer = null;
        // this.waitingMessage = 'Waiting for an opponent...';
    }

    getUser() {
        return this.auth.getUserName();
    }
}
