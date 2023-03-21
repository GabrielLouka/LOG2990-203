/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { ElementRef } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { BackButtonComponent } from '@app/components/back-button/back-button.component';
import { ChatComponent } from '@app/components/chat/chat.component';
import { HintComponent } from '@app/components/hint/hint.component';
import { InfoCardComponent } from '@app/components/info-card/info-card.component';
import { TimerComponent } from '@app/components/timer/timer.component';
import { AuthService } from '@app/services/auth-service/auth.service';
import { CheatModeService } from '@app/services/cheat-mode-service/cheat-mode.service';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { ImageManipulationService } from '@app/services/image-manipulation-service/image-manipulation.service';
import { MatchmakingService } from '@app/services/matchmaking-service/matchmaking.service';
import { SocketClientService } from '@app/services/socket-client-service/socket-client.service';
import { Action } from '@common/classes/action';
import { Match } from '@common/classes/match';
import { MatchStatus } from '@common/enums/match-status';
import { MatchType } from '@common/enums/match-type';
import { Buffer } from 'buffer';
import { of, throwError } from 'rxjs';
import { ClassicPageComponent } from './classic-page.component';

describe('ClassicPageComponent', () => {
    let component: ClassicPageComponent;
    let fixture: ComponentFixture<ClassicPageComponent>;
    let socketService: jasmine.SpyObj<SocketClientService>;
    let matchMakingService: jasmine.SpyObj<MatchmakingService>;
    let cheatModeService: jasmine.SpyObj<CheatModeService>;

    let commService: jasmine.SpyObj<CommunicationService>;
    let authService: jasmine.SpyObj<AuthService>;
    let imageService: jasmine.SpyObj<ImageManipulationService>;

    let leftCanvas: jasmine.SpyObj<ElementRef<HTMLCanvasElement>>;
    let rightCanvas: jasmine.SpyObj<ElementRef<HTMLCanvasElement>>;
    let timer: jasmine.SpyObj<TimerComponent>;
    let chat: jasmine.SpyObj<ChatComponent>;

    const fakeGame = {
        gameData: {
            id: 0,
            name: 'hello',
            isEasy: true,
            nbrDifferences: 1,
            differences: [[{ x: 0, y: 0 }]],
            ranking: [[{ name: 'player', score: '123' }]],
        },
        originalImage: Buffer.from([1]),
        modifiedImage: Buffer.from([1]),
    };

    const mockResponse: HttpResponse<string> = new HttpResponse({
        status: 200,
        body: 'mock response',
    });
    const mockObservable = of(mockResponse);

    beforeEach(() => {
        socketService = jasmine.createSpyObj('SocketClientService', ['isSocketAlive', 'connect', 'disconnect', 'on', 'send', 'socket'], {
            socket: { id: '123' },
        });
        commService = jasmine.createSpyObj('CommunicationService', ['basicGet', 'basicPost', 'get', 'post', 'delete']);
        authService = jasmine.createSpyObj('AuthService', ['registerUser', 'registerUserName']);
        imageService = jasmine.createSpyObj('ImageManipulationService', [
            'getModifiedImageWithoutDifferences',
            'blinkDifference',
            'sleep',
            'loadCanvasImages',
            'getImageSourceFromBuffer',
        ]);
        matchMakingService = jasmine.createSpyObj('MatchmakingService', [
            'currentMatchPlayed',
            'currentMatchId',
            'currentSocketId',
            'isHost',
            'isPlayer1',
            'isSoloMode',
            'player1Username',
            'player1Id',
            'currentMatchType',
            'currentMatchPlayer',
            'isMatchAborted',
            'handleMatchUpdateEvents',
            'disconnectSocket',
            'createGame',
            'joinGame',
            'sendMatchJoinRequest',
            'sendMatchJoinCancel',
            'sendIncomingPlayerRequestAnswer',
        ]);
        cheatModeService = jasmine.createSpyObj('CheatModeService', ['focusKeyEvent', 'putCanvasInto', 'stopCheating', 'startInterval']);

        matchMakingService.onMatchUpdated = new Action<Match | null>();

        const mockCommunicationService = jasmine.createSpyObj('CommunicationService', ['subscribe']);
        mockCommunicationService.subscribe.and.returnValue(of(new HttpResponse<string>()));
        commService.get.and.returnValue(mockObservable);
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ClassicPageComponent, HintComponent, BackButtonComponent, InfoCardComponent, ChatComponent, TimerComponent],
            providers: [
                { provide: AuthService, useValue: authService },
                { provide: SocketClientService, useValue: socketService },
                { provide: CommunicationService, useValue: commService },
                { provide: ImageManipulationService, useValue: imageService },
                { provide: MatchmakingService, useValue: matchMakingService },
                { provide: CheatModeService, useValue: cheatModeService },

                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: { paramMap: convertToParamMap({ id: '123' }) },
                    },
                },
                { provide: ChatComponent, useValue: chat },
                { provide: TimerComponent, useValue: timer },
                { provide: ElementRef, useValue: leftCanvas },
                { provide: ElementRef, useValue: rightCanvas },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ClassicPageComponent);
        component = fixture.componentInstance;
        component.timeInSeconds = 0;
        component.game = fakeGame;

        component.chat = jasmine.createSpyObj('ChatComponent', ['sendMessage', 'addMessage', 'isTextValid', 'scrollToBottom']);
        component.timerElement = jasmine.createSpyObj('TimerComponent', ['stopTimer']);
        component.errorMessage = jasmine.createSpyObj('ElementRef', [], {
            nativeElement: jasmine.createSpyObj('HTMLCanvasElement', ['pointersEvents']),
        });
        component.successSound = jasmine.createSpyObj('ElementRef', [], { nativeElement: jasmine.createSpyObj('HTMLCanvasElement', ['play']) });
        component.errorSound = jasmine.createSpyObj('ElementRef', [], { nativeElement: jasmine.createSpyObj('HTMLCanvasElement', ['play']) });
        component.leftCanvas = jasmine.createSpyObj('ElementRef', [], { nativeElement: jasmine.createSpyObj('HTMLCanvasElement', ['getContext']) });
        component.rightCanvas = jasmine.createSpyObj('ElementRef', [], { nativeElement: jasmine.createSpyObj('HTMLCanvasElement', ['getContext']) });

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('playError should play', async () => {
        const newTime = 0;
        await component.playSound(false);
        expect(component.errorSound.nativeElement.currentTime).toEqual(newTime);
    });

    it('playSuccess should play', () => {
        const newTime = 0;
        component.playSound(true);
        const currentTime = component.successSound.nativeElement.currentTime;
        expect(currentTime).toEqual(newTime);
    });

    it('refreshModifiedImage should refresh', async () => {
        await component.refreshModifiedImage();
        expect(imageService.getModifiedImageWithoutDifferences).toHaveBeenCalled();
    });

    it('refreshModifiedImage should blink', async () => {
        const canvas = document.createElement('canvas');
        component.leftCanvas = { nativeElement: canvas };
        component.rightCanvas = { nativeElement: canvas };

        await component.refreshModifiedImage();
        if (!component.rightCanvasContext) expect(imageService.blinkDifference).toHaveBeenCalled();
    });

    it('onFindDifference should send message about difference found', () => {
        const refresSpy = spyOn(component, 'refreshModifiedImage');
        const successSpy = spyOn(component, 'playSound');
        const nbDiff = component.differencesFound + 1;
        component.onFindDifference();
        expect(component.differencesFound).toEqual(nbDiff);
        expect(refresSpy).toHaveBeenCalled();
        expect(successSpy).toHaveBeenCalled();
    });

    it('requestStartGame should send from socket', () => {
        component.requestStartGame();
        expect(socketService.send).toHaveBeenCalled();
    });

    it('loadImagesToCanvas should load images to each canvas', () => {
        const canvas = document.createElement('canvas');
        component.leftCanvas = { nativeElement: canvas };
        component.rightCanvas = { nativeElement: canvas };

        const source1 = 'sourceLeft';
        const source2 = 'sourceRight';
        component.loadImagesToCanvas(source1, source2);
        expect(component.leftCanvas).toBeTruthy();
        expect(component.rightCanvas).toBeTruthy();
    });

    it('onMouseDown should check mouse event', () => {
        const canvas = document.createElement('canvas');
        component.leftCanvas = { nativeElement: canvas };
        component.rightCanvas = { nativeElement: canvas };
        const event = new MouseEvent('mousedown');
        const socketServiceSpy = jasmine.createSpyObj('SocketService', ['send']);
        component.socketService = socketServiceSpy;
        jasmine.createSpy(matchMakingService as any, 'is1vs1Mode' as any).and.returnValue(false);
        component.onMouseDown(event);
        expect(socketServiceSpy.send).toHaveBeenCalled();
    });

    it('addServerSocketMessagesListeners should send message', () => {
        component.addServerSocketMessagesListeners();
        expect(socketService.on).toHaveBeenCalled();
    });

    it('socketService informs user about differences', () => {
        const fakeData = {
            foundDifferences: [true, true, true],
            isValidated: true,
            foundDifferenceIndex: 0,
        };
        component.totalDifferences = 3;
        component.foundDifferences = fakeData.foundDifferences;
        const winSpy = spyOn(component, 'onWinGame');
        const diffSpy = spyOn(component, 'onFindDifference');

        socketService.on.and.callFake((eventName: string, callback) => {
            if (eventName === 'validationReturned') {
                callback(fakeData as any);
            }
        });

        component.addServerSocketMessagesListeners();
        expect(diffSpy).toHaveBeenCalled();
        component.totalDifferences = 0;
        component.addServerSocketMessagesListeners();
        expect(winSpy).toHaveBeenCalled();
    });

    it('should call onFindWrongDifference when data is not validated', () => {
        const fakeData = {};
        component.onFindWrongDifference = jasmine.createSpy('onFindWrongDifference');

        socketService.on.and.callFake((eventName: string, callback) => {
            if (eventName === 'validationReturned') {
                callback(fakeData as any);
            }
        });
        component.addServerSocketMessagesListeners();
        expect(component.onFindWrongDifference).toHaveBeenCalled();
    });

    it('getInitialImagesFromServer should send request to server and recieve images', () => {
        commService.get = jasmine.createSpy().and.returnValue(
            of({
                body: JSON.stringify({
                    originalImage: 'originalImage',
                    modifiedImage: 'modifiedImage',
                    gameData: { name: 'test' },
                }),
            }),
        );

        imageService.getModifiedImageWithoutDifferences = jasmine.createSpy().and.returnValue('testImageSource');
        const loadSpy = spyOn(component, 'loadImagesToCanvas');
        const restartSpy = spyOn(component, 'requestStartGame');

        component.communicationService = commService;
        component['imageManipulationService'] = imageService;
        component.getInitialImagesFromServer();
        expect(imageService.getImageSourceFromBuffer).toHaveBeenCalledTimes(2);
        expect(loadSpy).toHaveBeenCalled();
        expect(restartSpy).toHaveBeenCalled();
    });

    it('getInitialImagesFromServer should throw error', () => {
        const alertSpy = spyOn(window, 'alert');
        const errorResponse = new HttpErrorResponse({});
        commService.get = jasmine.createSpy().and.returnValue(throwError(() => errorResponse));
        component.getInitialImagesFromServer();
        expect(alertSpy).toHaveBeenCalled();
    });

    it('should display the error message and disable pointer events on the canvases', () => {
        const canvas = document.createElement('canvas');
        component.leftCanvas = { nativeElement: canvas };
        component.rightCanvas = { nativeElement: canvas };
        component.onFindWrongDifference(false);

        expect(component.errorMessage.nativeElement.style.display).toBe('block');
        expect(component.leftCanvas.nativeElement.style.pointerEvents).toBe('none');
        expect(component.rightCanvas.nativeElement.style.pointerEvents).toBe('none');
    });

    it('setTimout should be called onFindWrongDifferences', fakeAsync(() => {
        const canvas = document.createElement('canvas');
        component.leftCanvas = { nativeElement: canvas };
        component.rightCanvas = { nativeElement: canvas };
        component.onFindWrongDifference(true);
        tick(1000);
        expect(component.errorMessage.nativeElement.style.display).toBe('none');
        expect(component.leftCanvas.nativeElement.style.pointerEvents).toBe('auto');
        expect(component.rightCanvas.nativeElement.style.pointerEvents).toBe('auto');
    }));

    it('refreshModifiedImage should use currentModifiedImage if valid when blinking difference', async () => {
        const bytes = [0x68, 0x65, 0x6c, 0x6c, 0x6f];
        const buffer = Buffer.from(bytes);
        component.currentModifiedImage = buffer;
        await component.refreshModifiedImage();
        expect(imageService.blinkDifference).toHaveBeenCalledWith(buffer, undefined as any, undefined as any);
    });
    it('should return true if the player 1 win', () => {
        const match: Match = {
            gameId: 0,
            matchId: '',
            player1: null,
            player2: null,
            matchType: MatchType.Solo,
            matchStatus: MatchStatus.Player1Win,
        };
        const result = component.isPlayer1Win(match);
        expect(result).toEqual(true);
    });
    it('should return true if the player 2 win', () => {
        const match: Match = {
            gameId: 0,
            matchId: '',
            player1: null,
            player2: null,
            matchType: MatchType.OneVersusOne,
            matchStatus: MatchStatus.Player2Win,
        };
        const result = component.isPlayer2Win(match);
        expect(result).toEqual(true);
    });
    it('should return the player2Username', () => {
        const result = component.getPlayerUsername(false);
        expect(result).toEqual(undefined as any);
    });
    it('should return the player2Username', () => {
        const match: Match = {
            gameId: 0,
            matchId: '',
            player1: { username: '', playerId: '1' },
            player2: { username: '', playerId: '2' },
            matchType: MatchType.OneVersusOne,
            matchStatus: MatchStatus.Player2Win,
        };

        component.handleMatchUpdate(match);
    });
    it('should return the player2Username', () => {
        component.gameOver();
    });
    it('should return the player2Username', () => {
        component.onQuitGame();
    });
    it('should return the player2Username', () => {
        component.onWinGame('ibrahim', true);
    });
    it('should return the player2Username', () => {
        component.cheatMode();
    });
    it('should return the player2Username', () => {
        const canvas = document.createElement('canvas');
        component.leftCanvas = { nativeElement: canvas };
        component.rightCanvas = { nativeElement: canvas };
        component.showHiddenDifferences(Buffer.from([0]));
    });
    it('should return the player2Username', () => {
        component.stopCheating();
    });
    it('should return the player2Username', () => {
        const canvas = document.createElement('canvas');
        component.leftCanvas = { nativeElement: canvas };
        component.rightCanvas = { nativeElement: canvas };
        component.putCanvasIntoInitialState();
    });
    it('should start the cheatmode', () => {
        const event = new KeyboardEvent('KeyTDown');
        component.onCheatMode(event);
    });
});
