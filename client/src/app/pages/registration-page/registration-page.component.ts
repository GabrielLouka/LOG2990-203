import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SpinnerComponent } from '@app/components/spinner/spinner.component';
import { AuthService } from '@app/services/auth-service/auth.service';
import { IncomingPlayerService } from '@app/services/incoming-player-service/incoming-player.service';
import { MatchmakingService } from '@app/services/matchmaking-service/matchmaking.service';
import { RegistrationService } from '@app/services/registration-service/registration.service';
import { Match } from '@common/match';
import { Player } from '@common/player';

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
    hasUsernameRegistered: boolean = false;
    hasSentJoinRequest: boolean;

    registrationForm = new FormGroup({
        username: new FormControl('', Validators.compose([Validators.required, Validators.pattern('^[a-zA-Z0-9]{3,15}$')])),
    });

    // eslint-disable-next-line max-params
    constructor(
        private auth: AuthService,
        private route: ActivatedRoute,
        private readonly matchmakingService: MatchmakingService,
        private readonly incomingPlayerService: IncomingPlayerService,
        private readonly registrationService: RegistrationService,
    ) {}

    get user() {
        return this.auth.registeredUsername;
    }

    get hasFoundIncomingPlayer(): boolean {
        return this.incomingPlayerService.hasFoundOpponent;
    }

    get queueStatusMessage(): string {
        return this.incomingPlayerService.statusToDisplay;
    }

    ngOnInit(): void {
        this.id = this.route.snapshot.paramMap.get('id');
        this.matchmakingService.onGetJoinRequestAnswer.add(this.handleIncomingPlayerJoinRequestAnswer.bind(this));
        this.matchmakingService.onMatchUpdated.add(this.handleMatchUpdated.bind(this));
        this.matchmakingService.onGetJoinRequest.add(this.incomingPlayerService.handleIncomingPlayerJoinRequest.bind(this.incomingPlayerService));
        this.matchmakingService.onGetJoinCancel.add(this.incomingPlayerService.handleIncomingPlayerJoinCancel.bind(this.incomingPlayerService));
        this.signalRedirection();
        this.signalRedirectionOneGame();
    }

    ngOnDestroy(): void {
        if (this.username && this.hasSentJoinRequest) this.matchmakingService.sendMatchJoinCancel(this.username);

        this.matchmakingService.onGetJoinRequest.clear();
        this.matchmakingService.onGetJoinCancel.clear();
        this.matchmakingService.onGetJoinRequestAnswer.clear();
        this.matchmakingService.onMatchUpdated.clear();
        this.hasSentJoinRequest = false;
        this.incomingPlayerService.reset();
    }

    loadGamePage() {
        this.registrationService.loadGamePage(this.id);
    }

    registerUser() {
        this.auth.registerUser(this.registrationForm.value.username as string);
        this.username = this.registrationForm.value.username;
        this.hasUsernameRegistered = true;

        if (this.matchmakingService.currentMatchPlayed) {
            if (this.username && this.matchmakingService.is1vs1Mode) {
                this.matchmakingService.currentMatchPlayer = this.username;
            } else if (this.username && this.matchmakingService.isSoloMode) {
                this.matchmakingService.currentMatchPlayer = this.username;
            } else window.alert('Username to register is not valid !');

            if (this.matchmakingService.isSoloMode) {
                this.loadGamePage();
            } else {
                this.incomingPlayerService.updateWaitingForIncomingPlayerMessage();
            }
        } else {
            this.sendMatchJoinRequest();
        }
    }

    handleIncomingPlayerJoinRequestAnswer(data: { matchId: string; player: Player; isAccepted: boolean }) {
        if (
            this.incomingPlayerService.isAcceptedByHost(data.isAccepted, data.player) ||
            this.incomingPlayerService.isHostAcceptingIncomingPlayer(data.isAccepted)
        ) {
            this.loadGamePage();
        }

        if (this.incomingPlayerService.isHostRejectingIncomingPlayer(data.isAccepted)) {
            this.incomingPlayerService.handleHostRejectingIncomingPlayer();
            if (this.incomingPlayerService.hasIncomingPlayer) {
                this.incomingPlayerService.handleIncomingPlayerJoinRequest(this.incomingPlayerService.firstIncomingPlayer);
            }
        }
        if (this.incomingPlayerService.isRejectedByHost(data.isAccepted, data.player)) {
            this.registrationService.redirectToMainPage();
        }
    }

    sendMatchJoinRequest() {
        this.hasSentJoinRequest = true;
        this.incomingPlayerService.updateWaitingForIncomingPlayerAnswerMessage();
        if (this.username) this.matchmakingService.sendMatchJoinRequest(this.username);
    }

    handleMatchUpdated(match: Match | null) {
        if (!match) return;

        if (!this.matchmakingService.isHost) {
            if (this.matchmakingService.isMatchAborted(match)) {
                this.registrationService.redirectToMainPage();
            }
        }
    }

    signalRedirection() {
        this.registrationService.signalRedirection();
    }

    signalRedirectionOneGame() {
        this.registrationService.signalRedirectionOneGame();
    }
    acceptIncomingPlayer() {
        this.incomingPlayerService.acceptIncomingPlayer();
    }

    refuseIncomingPlayer() {
        this.incomingPlayerService.refuseIncomingPlayer();
    }
}
