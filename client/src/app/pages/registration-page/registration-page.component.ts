import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@app/services/auth.service';
import { MatchmakingService } from '@app/services/matchmaking.service';
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
    }
    registerUser() {
        this.auth.registerUser(this.registrationForm.value.username as string);
        this.username = this.registrationForm.value.username;
        this.usernameRegistered = true;

        if (this.matchmakingService.getCurrentMatch() != null) {
            if (this.username) this.matchmakingService.setCurrentMatchPlayer(this.username);
            else window.alert('Username to register is not valid !');
            if (this.matchmakingService.getCurrentMatch()?.matchType === MatchType.Solo) {
                this.router.navigate(['/classic', this.id]);
            } else {
                this.waitingMessage = 'Waiting for an opponent...';
            }
        } else {
            this.sendMatchJoinRequest();
        }
    }

    sendMatchJoinRequest() {
        this.waitingMessage = 'Waiting for the opponent to accept...';
        if (this.username) this.matchmakingService.sendMatchJoinRequest(this.username);
    }

    handleIncomingPlayerJoinRequest(playerThatWantsToJoin: Player) {
        this.incomingPlayerFound = true;
        this.waitingMessage = `${playerThatWantsToJoin.username} wants to join your game !`;
        this.incomingPlayer = playerThatWantsToJoin;
    }

    acceptIncomingPlayer() {
        window.alert('You accepted');
    }

    refuseIncomingPlayer() {
        window.alert('You refused');
    }

    getUser() {
        return this.auth.getUserName();
    }
}
