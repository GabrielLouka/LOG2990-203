import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SpinnerComponent } from '@app/components/spinner/spinner.component';
import { AuthService } from '@app/services/auth-service/auth.service';
import { MatchManagerService } from '@app/services/match-manager-service/match-manager.service';
import { QueueManagerService } from '@app/services/queue-manager-service/queue-manager.service';
import { SocketClientService } from '@app/services/socket-client-service/socket-client.service';
import { Match } from '@common/match';
import { Player } from '@common/player';
import { CLASSIC_PATH, HOME_PATH } from '@common/utils/env.http';

@Component({
    selector: 'app-registration-page',
    templateUrl: './registration-page.component.html',
    styleUrls: ['./registration-page.component.scss'],
})
export class RegistrationPageComponent implements OnInit, OnDestroy {
    @ViewChild('spinner') spinner: SpinnerComponent;

    username: string | null | undefined;
    id: string | null;
    // used to determine if we should display the username field in the html page
    hasUsernameRegistered: boolean;
    hasSentJoinRequest: boolean;

    registrationForm = new FormGroup({
        username: new FormControl('', Validators.compose([Validators.required, Validators.pattern('^[a-zA-Z0-9]{3,15}$')])),
    });

    // eslint-disable-next-line max-params
    constructor(
        private auth: AuthService,
        private route: ActivatedRoute,
        private readonly router: Router,
        private readonly matchManagerService: MatchManagerService,
        private readonly queueManagerService: QueueManagerService,
        private readonly socketService: SocketClientService,
    ) {
        this.hasSentJoinRequest = false;
    }

    get user() {
        return this.auth.registeredUsername;
    }

    get hasFoundIncomingPlayer(): boolean {
        return this.queueManagerService.hasFound;
    }

    get queueStatusMessage(): string {
        return this.queueManagerService.queueStatusToDisplay;
    }

    ngOnInit(): void {
        this.id = this.route.snapshot.paramMap.get('id');
        this.matchManagerService.onGetJoinRequest.add(this.handleIncomingPlayerJoinRequest.bind(this));
        this.matchManagerService.onGetJoinCancel.add(this.handleIncomingPlayerJoinCancel.bind(this));
        this.matchManagerService.onGetJoinRequestAnswer.add(this.handleIncomingPlayerJoinRequestAnswer.bind(this));
        this.matchManagerService.onMatchUpdated.add(this.handleMatchUpdated.bind(this));
        this.signalRedirection();
        this.signalRedirectionOneGame();
    }

    ngOnDestroy(): void {
        if (this.username && this.hasSentJoinRequest) this.matchManagerService.sendMatchJoinCancel(this.username);

        this.matchManagerService.onGetJoinRequest.clear();
        this.matchManagerService.onGetJoinCancel.clear();
        this.matchManagerService.onGetJoinRequestAnswer.clear();
        this.matchManagerService.onMatchUpdated.clear();
    }

    loadGamePage() {
        this.router.navigate([CLASSIC_PATH, this.id]);
    }

    registerUser() {
        this.auth.registerUser(this.registrationForm.value.username as string);
        this.username = this.registrationForm.value.username;
        this.hasUsernameRegistered = true;

        if (this.matchManagerService.currentMatchPlayed) {
            if (this.username && this.matchManagerService.is1vs1Mode) {
                this.matchManagerService.currentMatchPlayer = this.username;
            } else if (this.username && this.matchManagerService.isSoloMode) {
                this.matchManagerService.currentMatchPlayer = this.username;
            } else window.alert('Username to register is not valid !');

            if (this.matchManagerService.isSoloMode) {
                this.loadGamePage();
            } else {
                this.queueManagerService.queueMessage = "En attente d'un adversaire...";
            }
        } else {
            this.sendMatchJoinRequest();
        }
    }

    handleIncomingPlayerJoinRequest(playerThatWantsToJoin: Player) {
        this.queueManagerService.handleIncomingPlayerJoinRequest(playerThatWantsToJoin);
    }

    handleIncomingPlayerJoinCancel(playerIdThatCancelledTheirJoinRequest: string) {
        this.queueManagerService.handleIncomingPlayerJoinCancel(playerIdThatCancelledTheirJoinRequest);
    }

    handleIncomingPlayerJoinRequestAnswer(data: { matchId: string; player: Player; isAccepted: boolean }) {
        if (
            this.queueManagerService.isAcceptedByHost(data.isAccepted, data.player) ||
            this.queueManagerService.isHostAcceptingIncomingPlayer(data.isAccepted)
        ) {
            this.loadGamePage();
        }

        if (this.queueManagerService.isHostRejectingIncomingPlayer(data.isAccepted)) {
            this.queueManagerService.handleHostRejectingIncomingPlayer();
            if (this.queueManagerService.hasIncomingPlayer) {
                this.queueManagerService.handleIncomingPlayerJoinRequest(this.queueManagerService.firstPlayerInQueue);
            }
        }
        if (this.queueManagerService.isRejectedByHost(data.isAccepted, data.player)) {
            this.router.navigate(['/']);
        }
    }

    sendMatchJoinRequest() {
        this.hasSentJoinRequest = true;
        this.queueManagerService.queueMessage = "En attente de la réponse de l'adversaire...";
        if (this.username) this.matchManagerService.sendMatchJoinRequest(this.username + '#2');
    }

    signalRedirection() {
        this.socketService.on('allGameDeleted', () => {
            const pathSegments = window.location.href.split('/');
            const lastSegment = pathSegments[pathSegments.length - 2];
            if (lastSegment === 'registration') {
                this.router.navigate([HOME_PATH]).then(() => {
                    alert("Le jeu a été supprimé, vous avez donc été redirigé à l'accueil");
                });
            }
        });
    }

    signalRedirectionOneGame() {
        this.socketService.on('gameDeleted', (data: { hasDeletedGame: boolean; id: string }) => {
            const pathSegments = window.location.href.split('/');
            const pageName = pathSegments[pathSegments.length - 2];
            const idPage = pathSegments[pathSegments.length - 1];
            if (pageName === 'registration' && data.id === idPage) {
                this.router.navigate([HOME_PATH]).then(() => {
                    alert("Le jeu a été supprimé, vous avez donc été redirigé à l'accueil");
                });
            }
        });
    }

    handleMatchUpdated(match: Match | null) {
        if (!match) return;

        if (!this.matchManagerService.isHost) {
            if (this.matchManagerService.isMatchAborted(match)) {
                this.router.navigate(['/']);
            }
        }
    }

    acceptIncomingPlayer() {
        this.queueManagerService.acceptIncomingPlayer();
    }

    refuseIncomingPlayer() {
        this.queueManagerService.refuseIncomingPlayer();
    }
}
