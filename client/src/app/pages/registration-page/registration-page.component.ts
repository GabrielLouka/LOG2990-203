import { Component, OnInit } from '@angular/core';
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
export class RegistrationPageComponent implements OnInit {
    username: string | null | undefined;
    id: string | null;
    // used to determine if we should display the username field in the page
    usernameRegistered: boolean;
    waitingMessage: string = 'Loading';
    incomingPlayerFound: boolean;
    incomingPlayer: Player | null = null;

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
        this.matchmakingService.onGetJoinRequestAnswer.add(this.handleIncomingPlayerJoinRequestAnswer.bind(this));
        this.matchmakingService.onMatchUpdated.add(this.handleMatchUpdated.bind(this));
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
        this.waitingMessage = 'Waiting for the opponent to accept...';
        if (this.username) this.matchmakingService.sendMatchJoinRequest(this.username);
    }

    handleIncomingPlayerJoinRequest(playerThatWantsToJoin: Player) {
        if (!this.matchmakingService.isHost) return;
        this.incomingPlayerFound = true;
        this.waitingMessage = `${playerThatWantsToJoin.username} wants to join your game !`;
        this.incomingPlayer = playerThatWantsToJoin;
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
        if (!data.accept && this.matchmakingService.isHost) {
            this.waitingMessage = 'Waiting for an opponent...';
            this.incomingPlayerFound = false;
            this.incomingPlayer = null;
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
    }

    refuseIncomingPlayer() {
        if (this.incomingPlayer == null) return;
        this.matchmakingService.sendIncomingPlayerRequestAnswer(this.incomingPlayer, false);
    }

    getUser() {
        return this.auth.getUserName();
    }
}
