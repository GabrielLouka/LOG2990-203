// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { FormGroup } from '@angular/forms';
// import { ActivatedRoute, convertToParamMap } from '@angular/router';
// import { AuthService } from '@app/services/auth-service/auth.service';
// import { IncomingPlayerService } from '@app/services/incoming-player-service/incoming-player.service';
// import { MatchmakingService } from '@app/services/matchmaking-service/matchmaking.service';
// import { RegistrationService } from '@app/services/registration-service/registration.service';
// import { Action } from '@common/classes/action';
// import { Match } from '@common/classes/match';
// import { Player } from '@common/classes/player';
// import { MatchStatus } from '@common/enums/match-status';
// import { MatchType } from '@common/enums/match-type';
// import { RegistrationPageComponent } from './registration-page.component';

// describe('RegistrationPageComponent', () => {
//     let component: RegistrationPageComponent;
//     let fixture: ComponentFixture<RegistrationPageComponent>;
//     let authService: jasmine.SpyObj<AuthService>;
//     let matchmakingService: jasmine.SpyObj<MatchmakingService>;
//     let incomingPlayerService: jasmine.SpyObj<IncomingPlayerService>;
//     let registrationService: jasmine.SpyObj<RegistrationService>;

//     const player1: Player = {
//         username: 'player1',
//         playerId: 'socket1',
//     };

//     const player2: Player = {
//         username: 'player2',
//         playerId: 'socket2',
//     };

//     beforeEach(() => {
//         authService = jasmine.createSpyObj('AuthService', ['registerUser', 'registeredUserName']);
//         incomingPlayerService = jasmine.createSpyObj('IncomingPlayerService', [
//             'hasFoundOpponent',
//             'statusToDisplay',
//             'updateWaitingForIncomingPlayerMessage',
//             'updateWaitingForIncomingPlayerAnswerMessage',
//             'handleIncomingPlayerJoinCancel',
//             'handleIncomingPlayerJoinRequest',
//             'reset',
//             'isAcceptedByHost',
//             'isRejectedByHost',
//             'isHostAcceptingIncomingPlayer',
//             'isHostRejectingIncomingPlayer',
//             'handleHostRejectingIncomingPlayer',
//             'hasIncomingPlayer',
//             'firstIncomingPlayer',
//             'acceptIncomingPlayer',
//             'refuseIncomingPlayer',
//         ]);
//         registrationService = jasmine.createSpyObj('RegistrationService', ['loadGamePage', 'handleGameDeleted', 'redirectToMainPage']);
//         matchmakingService = jasmine.createSpyObj('MatchmakingService', [
//             'onGetJoinRequestAnswer',
//             'onMatchUpdated',
//             'onGetJoinRequest',
//             'onGetJoinCancel',
//             'sendMatchJoinCancel',
//             'currentMatchPlayed',
//             'is1vs1Mode',
//             'currentMatchPlayer',
//             'isSoloMode',
//             'isMatchAborted',
//             'createGame',
//             'sendMatchJoinRequest',
//         ]);
//         matchmakingService.onGetJoinRequestAnswer = new Action<{ matchId: string; player: Player; isAccepted: boolean }>();
//         matchmakingService.onMatchUpdated = new Action<Match | null>();
//         matchmakingService.onGetJoinRequest = new Action<Player>();
//         matchmakingService.onGetJoinCancel = new Action<string>();
//         matchmakingService.onAllGameDeleted = new Action<string | null>();
//         matchmakingService.onSingleGameDeleted = new Action<string | null>();
//     });

//     beforeEach(async () => {
//         await TestBed.configureTestingModule({
//             declarations: [RegistrationPageComponent],
//             providers: [
//                 { provide: AuthService, useValue: authService },
//                 {
//                     provide: ActivatedRoute,
//                     useValue: {
//                         snapshot: { paramMap: convertToParamMap({ id: '123' }) },
//                     },
//                 },
//                 { provide: MatchmakingService, useValue: matchmakingService },
//                 { provide: IncomingPlayerService, useValue: incomingPlayerService },
//                 { provide: RegistrationService, useValue: registrationService },
//             ],
//         }).compileComponents();

//         fixture = TestBed.createComponent(RegistrationPageComponent);
//         component = fixture.componentInstance;
//         fixture.detectChanges();
//     });

//     it('should create', () => {
//         expect(component).toBeTruthy();
//     });

//     it('component should have registration form as proprety', () => {
//         expect(component.registrationForm).toBeInstanceOf(FormGroup);
//     });

//     it('should return if the player has found an opponent', () => {
//         component.ngOnDestroy();
//         const hasFound = component.hasFoundIncomingPlayer;
//         expect(hasFound).not.toBe(false);
//     });

//     it('should set current match player if is solo mode', () => {
//         const match: Match = {
//             gameId: 1,
//             matchId: 'socket1',
//             player1: { username: 'user', playerId: '1' },
//             player2: null,
//             player1Archive: { username: 'user', playerId: '1' },
//             player2Archive: null,
//             matchType: MatchType.Solo,
//             matchStatus: MatchStatus.InProgress,
//         };
//         component.handleMatchUpdated(match);
//         component.registrationForm.setValue({ username: 'user' });
//         component.username = 'naruto';
//         authService.registerUser.and.callThrough();
//         component.registerUser();
//         matchmakingService.setCurrentMatchType(MatchType.Solo);
//         expect(registrationService.redirectToMainPage).not.toHaveBeenCalled();
//     });

//     it('should set current match player if is solo mode', () => {
//         const match: Match = {
//             gameId: 1,
//             matchId: 'socket1',
//             player1: null,
//             player2,
//             player1Archive: null,
//             player2Archive: null,
//             matchType: MatchType.OneVersusOne,
//             matchStatus: MatchStatus.Aborted,
//         };
//         component.handleMatchUpdated(match);
//         expect(registrationService.redirectToMainPage).not.toHaveBeenCalled();
//     });

//     it('should not to redirect to main page if match update is null', () => {
//         component.handleMatchUpdated(null);
//         expect(registrationService.redirectToMainPage).not.toHaveBeenCalled();
//     });

//     it('should register a user with the auth service', () => {
//         component.registrationForm.setValue({ username: 'user' });
//         authService.registerUser.and.callThrough();
//         component.registerUser();
//         const resultUser = component.username;
//         const usernameRegisteredResult = component.hasUsernameRegistered;
//         expect(usernameRegisteredResult).toBe(true);
//         expect(resultUser).not.toBe('');
//     });

//     it('should get the registered user name from the auth service', () => {
//         component.registrationForm.setValue({ username: 'testuser' });
//         authService.registerUser.and.callThrough();
//         component.registerUser();
//         const result = component.user;
//         expect(result).toBeUndefined();
//     });
//     it('should handle incoming player join request answer', () => {
//         const match: Match = {
//             gameId: 1,
//             matchId: 'socket1',
//             player1,
//             player2: null,
//             player1Archive: player1,
//             player2Archive: null,
//             matchType: MatchType.Solo,
//             matchStatus: MatchStatus.InProgress,
//         };
//         component.handleMatchUpdated(match);
//         component.registrationForm.setValue({ username: 'user' });
//         authService.registerUser.and.callThrough();
//         component.registerUser();
//         const data = { matchId: 'socket1', player: player1, isAccepted: true };
//         component.handleIncomingPlayerJoinRequestAnswer(data);
//         expect(component.user).not.toEqual('');
//     });

//     it('should call registration service when load game is needed', () => {
//         component.loadGamePage();
//         expect(registrationService.loadGamePage).toHaveBeenCalled();
//     });

//     it('should set to true when sent join request', () => {
//         component.username = 'naruto';
//         component.sendMatchJoinRequest();
//         expect(component.hasSentJoinRequest).toBe(true);
//     });

//     it('should call incoming player service when accept/refuse incoming player', () => {
//         component.acceptIncomingPlayer();
//         expect(incomingPlayerService.acceptIncomingPlayer).toHaveBeenCalled();
//         component.refuseIncomingPlayer();
//         expect(incomingPlayerService.refuseIncomingPlayer).toHaveBeenCalled();
//     });
//     it('should return status display', () => {
//         const result = component.queueStatusMessage;
//         expect(result).not.toBe('');
//     });
//     it('should return status display', () => {
//         component.username = 'mahmoud';
//         component.hasSentJoinRequest = true;
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         const spy = jasmine.createSpy('matchmakingService', 'sendMatchJoinCancel' as any);
//         component.ngOnDestroy();
//         expect(spy).not.toHaveBeenCalled();
//     });
// });
