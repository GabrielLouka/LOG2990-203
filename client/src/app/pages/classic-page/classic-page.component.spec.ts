/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-unused-vars */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { ElementRef } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { SocketTestHelper } from '@app/classes/socket-test-helper/socket-test-helper';
import { BackButtonComponent } from '@app/components/back-button/back-button.component';
import { ChatComponent } from '@app/components/chat/chat.component';
import { HintComponent } from '@app/components/hint/hint.component';
import { InfoCardComponent } from '@app/components/info-card/info-card.component';
import { TimerComponent } from '@app/components/timer/timer.component';
import { ClassicPageComponent } from '@app/pages/classic-page/classic-page.component';
import { AuthService } from '@app/services/auth-service/auth.service';
import { ChatService } from '@app/services/chat-service/chat.service';
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
import { Socket } from 'socket.io-client';
class SocketClientServiceMock extends SocketClientService {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    override connect() {}
}
describe('ClassicPageComponent', () => {
    let component: ClassicPageComponent;
    let fixture: ComponentFixture<ClassicPageComponent>;
    let matchMakingService: jasmine.SpyObj<MatchmakingService>;
    let cheatModeService: jasmine.SpyObj<CheatModeService>;
    let socketTestHelper: SocketTestHelper;
    let socketServiceMock: SocketClientServiceMock;
    let socketClientService: SocketClientService;

    let commService: jasmine.SpyObj<CommunicationService>;
    let authService: jasmine.SpyObj<AuthService>;
    let imageService: jasmine.SpyObj<ImageManipulationService>;
    let chatService: jasmine.SpyObj<ImageManipulationService>;
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
        socketTestHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock();
        socketServiceMock.socket = socketTestHelper as unknown as Socket;

        commService = jasmine.createSpyObj('CommunicationService', ['basicGet', 'basicPost', 'get', 'post', 'delete']);
        authService = jasmine.createSpyObj('AuthService', ['registerUser', 'registerUserName']);
        imageService = jasmine.createSpyObj('ImageManipulationService', [
            'getModifiedImageWithoutDifferences',
            'blinkDifference',
            'sleep',
            'loadCanvasImages',
            'getImageSourceFromBuffer',
        ]);
        chatService = jasmine.createSpyObj('ChatService', [
            'sendMessage',
            'sendMessageFromSystem',
            'clearMessage',
            'isTextValid',
            'isPlayer1',
            'isMode1vs1',
        ]);
        matchMakingService = jasmine.createSpyObj('MatchmakingService', [
            'currentMatchId',
            'currentMatchPlayed',
            'currentMatchType',
            'player1Username',
            'player1Username',
            'currentSocketId',
            'isHost',
            'isSoloMode',
            'is1vs1Mode',
            'isPlayer1',
            'player1Id',
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
                { provide: CommunicationService, useValue: commService },
                { provide: ImageManipulationService, useValue: imageService },
                { provide: MatchmakingService, useValue: matchMakingService },
                { provide: CheatModeService, useValue: cheatModeService },
                { provide: SocketClientService, useValue: socketServiceMock },

                { provide: ChatService, useValue: chatService },
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
        socketClientService = TestBed.inject(SocketClientService);
        const match: Match = {
            gameId: 0,
            matchId: '',
            player1: { username: 'mario', playerId: '1' },
            player2: { username: 'luigi', playerId: '2' },
            matchType: MatchType.OneVersusOne,
            matchStatus: MatchStatus.Player1Win,
        };

        matchMakingService['currentMatch'] = match;
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
    afterEach(() => {
        socketServiceMock.disconnect();
        socketTestHelper.disconnect();
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
        const nbDiff = component.differencesFound1 + 1;
        component.isCheating = true;
        component.onFindDifference();
        expect(component.differencesFound1 + 1).toEqual(nbDiff);
        expect(refresSpy).toHaveBeenCalled();
        expect(successSpy).toHaveBeenCalled();
    });

    it('requestStartGame should send from socket', () => {
        component.requestStartGame();
        expect(socketClientService.send).toHaveBeenCalled();
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
        component.canvasIsClickable = true;
        const socketServiceSpy = jasmine.createSpyObj('SocketService', ['send']);
        component.socketService = socketServiceSpy;
        component.onMouseDown(event);
        expect(socketServiceSpy.send).toHaveBeenCalled();
    });

    it('addServerSocketMessagesListeners should send message', () => {
        const match: Match = {
            gameId: 0,
            matchId: '',
            player1: { username: 'mario', playerId: '1' },
            player2: { username: 'luigi', playerId: '2' },
            matchType: MatchType.OneVersusOne,
            matchStatus: MatchStatus.Player1Win,
        };
        matchMakingService['currentMatch'] = match;
        spyOn(socketClientService, 'on').and.callThrough();
        component.addServerSocketMessagesListeners();
        const callback = ((params: any) => {}) as any;
        const data = { foundDifferences: [true, false, true], isValidated: true, foundDifferenceIndex: 1, isPlayer1: true };
        socketTestHelper.on('validationReturned', callback);
        socketTestHelper.peerSideEmit('validationReturned', data);
        expect(socketClientService.on).toHaveBeenCalledTimes(2);
    });
    it('addServerSocketMessagesListeners should send message', () => {
        const match: Match = {
            gameId: 0,
            matchId: '',
            player1: { username: 'mario', playerId: '1' },
            player2: { username: 'luigi', playerId: '2' },
            matchType: MatchType.OneVersusOne,
            matchStatus: MatchStatus.Player1Win,
        };
        matchMakingService['currentMatch'] = match;

        spyOn(socketClientService, 'on').and.callThrough();
        component.addServerSocketMessagesListeners();
        const callback = ((params: any) => {}) as any;
        const data = { foundDifferences: [true, false, true], isValidated: false, foundDifferenceIndex: 1, isPlayer1: true };
        socketTestHelper.on('validationReturned', callback);
        socketTestHelper.peerSideEmit('validationReturned', data);

        expect(socketClientService.on).toHaveBeenCalledTimes(2);
    });
    it('addServerSocketMessagesListeners should send message', () => {
        const match: Match = {
            gameId: 0,
            matchId: '',
            player1: { username: 'mario', playerId: '1' },
            player2: { username: 'luigi', playerId: '2' },
            matchType: MatchType.OneVersusOne,
            matchStatus: MatchStatus.Player1Win,
        };
        matchMakingService['currentMatch'] = match;

        spyOn(socketClientService, 'on').and.callThrough();
        component.addServerSocketMessagesListeners();
        const callback = ((params: any) => {}) as any;
        const data = { foundDifferences: [true, false, true], isValidated: true, foundDifferenceIndex: 1, isPlayer1: false };
        socketTestHelper.on('validationReturned', callback);
        socketTestHelper.peerSideEmit('validationReturned', data);

        expect(socketClientService.on).toHaveBeenCalledTimes(2);
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
    it('should return the player2', () => {
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
    it('should return the fff', () => {
        component.gameOver();
    });
    it('should return the f', () => {
        component.onQuitGame();
    });
    it('should return the fffff', () => {
        component.onWinGame('ibrahim', true);
    });
    it('should returnehjdjd', () => {
        component.cheatMode();
    });
    it('should return qqq', () => {
        const canvas = document.createElement('canvas');
        component.leftCanvas = { nativeElement: canvas };
        component.rightCanvas = { nativeElement: canvas };
        component.showHiddenDifferences(Buffer.from([0]));
    });
    it('should return eeeee', () => {
        component.stopCheating();
    });
    it('should return put canvas', () => {
        const canvas = document.createElement('canvas');
        component.leftCanvas = { nativeElement: canvas };
        component.rightCanvas = { nativeElement: canvas };
        component.putCanvasIntoInitialState();
    });
    it('should start the cheatmode', () => {
        const event = new KeyboardEvent('keydown', {
            ctrlKey: true,
            shiftKey: true,
            key: 't',
        });
        document.dispatchEvent(event);
        component.onCheatMode(event);
    });
    it('should start the cheatmode', () => {
        const event = new KeyboardEvent('keydown', {
            ctrlKey: true,
            shiftKey: true,
            key: 't',
        });
        document.dispatchEvent(event);
        component.onCheatMode(event);
        component.onCheatMode(event);
    });
    it('should call getInitialImagesFromServer() when both canvas contexts are defined', () => {
        const spy = spyOn(component, 'getInitialImagesFromServer');
        const canvas = document.createElement('canvas');
        component.leftCanvas = { nativeElement: canvas };
        component.rightCanvas = { nativeElement: canvas };

        component.ngAfterViewInit();

        expect(spy).toHaveBeenCalled();
    });
});
