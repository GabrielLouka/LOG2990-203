import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { AuthService } from '@app/services/auth-service/auth.service';
import { IncomingPlayerService } from '@app/services/incoming-player-service/incoming-player.service';
import { MatchmakingService } from '@app/services/matchmaking-service/matchmaking.service';
import { RegistrationService } from '@app/services/registration-service/registration.service';
import { Action } from '@common/classes/action';
import { Match } from '@common/classes/match';
import { Player } from '@common/classes/player';
import { RegistrationPageComponent } from './registration-page.component';

describe('RegistrationPageComponent', () => {
    let component: RegistrationPageComponent;
    let fixture: ComponentFixture<RegistrationPageComponent>;
    let authService: jasmine.SpyObj<AuthService>;
    let matchmakingService: jasmine.SpyObj<MatchmakingService>;
    let incomingPlayerService: jasmine.SpyObj<IncomingPlayerService>;
    let registrationService: jasmine.SpyObj<RegistrationService>;

    beforeEach(() => {
        authService = jasmine.createSpyObj('AuthService', ['registerUser', 'registeredUserName']);
        incomingPlayerService = jasmine.createSpyObj('IncomingPlayerService', [
            'hasFoundOpponent',
            'statusToDisplay',
            'updateWaitingForIncomingPlayerMessage',
            'updateWaitingForIncomingPlayerAnswerMessage',
            'handleIncomingPlayerJoinCancel',
            'handleIncomingPlayerJoinRequest',
            'reset',
            'isAcceptedByHost',
            'isRejectedByHost',
            'isHostAcceptingIncomingPlayer',
            'isHostRejectingIncomingPlayer',
            'handleHostRejectingIncomingPlayer',
            'hasIncomingPlayer',
            'firstIncomingPlayer',
            'acceptIncomingPlayer',
            'refuseIncomingPlayer',
        ]);
        registrationService = jasmine.createSpyObj('RegistrationService', [
            'loadGamePage',
            'signalRedirection',
            'signalRedirectionOneGame',
            'redirectToMainPage',
        ]);
        matchmakingService = jasmine.createSpyObj('MatchmakingService', [
            'onGetJoinRequestAnswer',
            'onMatchUpdated',
            'onGetJoinRequest',
            'onGetJoinCancel',
            'sendMatchJoinCancel',
            'currentMatchPlayed',
            'is1vs1Mode',
            'currentMatchPlayer',
            'isSoloMode',
            'isMatchAborted',
        ]);
        matchmakingService.onGetJoinRequestAnswer = new Action<{ matchId: string; player: Player; isAccepted: boolean }>();
        matchmakingService.onMatchUpdated = new Action<Match | null>();
        matchmakingService.onGetJoinRequest = new Action<Player>();
        matchmakingService.onGetJoinCancel = new Action<string>();
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [RegistrationPageComponent],
            providers: [
                { provide: AuthService, useValue: authService },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: { paramMap: convertToParamMap({ id: '123' }) },
                    },
                },
                { provide: MatchmakingService, useValue: matchmakingService },
                { provide: IncomingPlayerService, useValue: incomingPlayerService },
                { provide: RegistrationService, useValue: registrationService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(RegistrationPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('component should have registration form as proprety', () => {
        expect(component.registrationForm).toBeInstanceOf(FormGroup);
    });

    it('should register a user with the auth service', () => {
        component.registrationForm.setValue({ username: 'user' });
        authService.registerUser.and.callThrough();
        component.registerUser();
        const resultUser = component.user;
        const usernameRegisteredResult = component.hasUsernameRegistered;
        expect(usernameRegisteredResult).toBe(true);
        expect(resultUser).toBe('user');
    });

    it('should get the registered user name from the auth service', () => {
        component.registrationForm.setValue({ username: 'testuser' });
        authService.registerUser.and.callThrough();
        component.registerUser();
        const result = component.user;
        expect(result).toBe('testuser');
    });

    it('should clear the matchmaing variable on ngOndestroy', () => {
        const myActionSpy: jasmine.SpyObj<Action<unknown>> = jasmine.createSpyObj('Action', ['clear']);
        spyOn(component, 'ngOnDestroy').and.callThrough();
        component.ngOnDestroy();
        expect(component.ngOnDestroy).toHaveBeenCalled();
        expect(myActionSpy).toHaveBeenCalled();
    });
});
