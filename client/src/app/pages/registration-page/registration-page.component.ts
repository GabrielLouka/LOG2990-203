import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@app/services/auth.service';
import { MatchmakingService } from '@app/services/matchmaking.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { Match } from '@common/match';
import { MatchStatus } from '@common/match-status';
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
        private readonly socketService: SocketClientService,
    ) {}

    ngOnInit(): void {
        this.id = this.route.snapshot.paramMap.get('id');
        this.matchmakingService.onGetJoinRequest.add(this.handleIncomingPlayerJoinRequest.bind(this));
        this.matchmakingService.onGetJoinCancel.add(this.handleIncomingPlayerJoinCancel.bind(this));
        this.matchmakingService.onGetJoinRequestAnswer.add(this.handleIncomingPlayerJoinRequestAnswer.bind(this));
        this.matchmakingService.onMatchUpdated.add(this.handleMatchUpdated.bind(this));
        this.signalRedirection();
        this.signalRedirectionOneGame();
    }

    ngOnDestroy(): void {
        if (this.username && this.hasSentJoinRequest) this.matchmakingService.sendMatchJoinCancel(this.username);
    }

    registerUser() {
        this.auth.registerUser(this.registrationForm.value.username as string);
        this.username = this.registrationForm.value.username;
        this.usernameRegistered = true;
        if (this.matchmakingService.getCurrentMatch() != null) {
            if (this.username && this.matchmakingService.is1vs1Mode) {
                this.matchmakingService.setCurrentMatchPlayer(this.username + '#1');
            } else if (this.username && this.matchmakingService.isSoloMode) {
                this.matchmakingService.setCurrentMatchPlayer(this.username);
            } else window.alert('Username to register is not valid !');
            if (this.matchmakingService.isSoloMode) {
                this.loadGamePage();
            } else {
                this.waitingMessage = "En attente d'un adversaire...";
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
        this.waitingMessage = "En attente de la réponse de l'adversaire...";
        if (this.username) this.matchmakingService.sendMatchJoinRequest(this.username);
    }

    handleIncomingPlayerJoinRequest(playerThatWantsToJoin: Player) {
        if (!this.matchmakingService.isHost) return;

        if (!this.waitingPlayers.includes(playerThatWantsToJoin)) {
            this.waitingPlayers.push(playerThatWantsToJoin);
            playerThatWantsToJoin.username += '#2';
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
            this.waitingMessage = `Voulez-vous débuter la partie avec ${this.waitingPlayers[0].username}?\n`;
            this.waitingMessage += ' | Joueur(s) en attente : ';
            for (const player of this.waitingPlayers) {
                this.waitingMessage += ` ${player.username} \n ,`;
            }

            this.incomingPlayer = this.waitingPlayers[0];
        } else {
            this.waitingMessage = "En attente d'un adversaire";
            this.incomingPlayer = null;
        }
    }
    signalRedirection() {
        this.socketService.on('allGameDeleted', () => {
            const pathSegments = window.location.href.split('/');
            const lastSegment = pathSegments[pathSegments.length - 2];
            if (lastSegment === 'registration') {
                this.router.navigate(['/home']).then(() => {
                    window.alert("Le jeu a été supprimé, vous avez donc été redirigé à l'accueil");
                });
            }
        });
    }
    signalRedirectionOneGame() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.socketService.on('gameDeleted', (data: any) => {
            const pathSegments = window.location.href.split('/');
            const pageName = pathSegments[pathSegments.length - 2];
            const idPage = pathSegments[pathSegments.length - 1];
            if (pageName === 'registration' && data.id === idPage) {
                this.router.navigate(['/home']).then(() => {
                    window.alert("Le jeu a été supprimé, vous avez donc été redirigé à l'accueil");
                });
            }
        });
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
            this.waitingMessage = "En attente d'un adversaire...";
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
        if (!this.matchmakingService.isHost /* && match.matchStatus === MatchStatus.InProgress*/) {
            if (match.matchStatus === MatchStatus.Aborted) {
                // if the host left the game
                // eslint-disable-next-line no-console
                console.log('Host left the game !' + JSON.stringify(match));
                this.router.navigate(['/']);
            }
        }
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
    }

    getUser() {
        return this.auth.registeredUsername;
    }
}
