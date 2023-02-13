/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpResponse } from '@angular/common/http';
import { ElementRef } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { BackButtonComponent } from '@app/components/back-button/back-button.component';
import { ChatComponent } from '@app/components/chat/chat.component';
import { HintComponent } from '@app/components/hint/hint.component';
import { InfoCardComponent } from '@app/components/info-card/info-card.component';
import { TimerComponent } from '@app/components/timer/timer.component';
import { AuthService } from '@app/services/auth.service';
import { CommunicationService } from '@app/services/communication.service';
import { ImageManipulationService } from '@app/services/image-manipulation.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { Buffer } from 'buffer';
import { of } from 'rxjs';
import { ClassicPageComponent } from './classic-page.component';

describe('ClassicPageComponent', () => {
    let component: ClassicPageComponent;
    let fixture: ComponentFixture<ClassicPageComponent>;
    let socketService: jasmine.SpyObj<SocketClientService>;
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
        originalImage: Buffer.alloc(1),
        modifiedImage: Buffer.alloc(1),
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
        component.modal = jasmine.createSpyObj('ElementRef', ['nativeElement']);
        component.successSound = jasmine.createSpyObj('ElementRef', [], { nativeElement: jasmine.createSpyObj('HTMLCanvasElement', ['play']) });
        component.errorSound = jasmine.createSpyObj('ElementRef', [], { nativeElement: jasmine.createSpyObj('HTMLCanvasElement', ['play']) });
        component.leftCanvas = jasmine.createSpyObj('ElementRef', [], { nativeElement: jasmine.createSpyObj('HTMLCanvasElement', ['getContext']) });
        component.rightCanvas = jasmine.createSpyObj('ElementRef', [], { nativeElement: jasmine.createSpyObj('HTMLCanvasElement', ['getContext']) });
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('showPopUp should change modal value', () => {
        const newValue = 'flex';
        component.showPopUp();
        expect(component.modal.nativeElement.style.display).toEqual(newValue);
    });

    it('playError should play', async () => {
        const newTime = 0;
        await component.playErrorSound();
        expect(component.errorSound.nativeElement.currentTime).toEqual(newTime);
    });

    it('playSuccess should play', async () => {
        const newTime = 0;
        await component.playSuccessSound();
        expect(component.successSound.nativeElement.currentTime).toEqual(newTime);
    });

    it('refreshModifiedImage should refresh', async () => {
        await component.refreshModifiedImage();
        expect(imageService.getModifiedImageWithoutDifferences).toHaveBeenCalled();
    });

    it('refreshModifiedImage should blink', async () => {
        await component.refreshModifiedImage();
        if (!component.rightCanvasContext) expect(imageService.blinkDifference).toHaveBeenCalled();
    });

    it('onFindDifference should send message about difference found', () => {
        const refresSpy = spyOn(component, 'refreshModifiedImage');
        const successSpy = spyOn(component, 'playSuccessSound');
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
        const source1 = 'sourceLeft';
        const source2 = 'sourceRight';
        component.loadImagesToCanvas(source1, source2);
        expect(component.leftCanvas).toBeTruthy();
        expect(component.rightCanvas).toBeTruthy();
    });

    it('onMouseDown should check mouse event', () => {
        const event = new MouseEvent('mousedown');
        component.onMouseDown(event);
        expect(socketService.send).toHaveBeenCalled();
    });

    it('addServerSocketMessagesListeners should send message', () => {
        component.addServerSocketMessagesListeners();
        expect(socketService.on).toHaveBeenCalled();
    });

    it('connectToSocket should not disconnect if not alive', () => {
        const res = socketService.isSocketAlive();
        component.connectSocket();
        if (res) expect(socketService.disconnect).toHaveBeenCalled();
    });

    it('get socket id should return id', () => {
        const id = component.socketId;
        expect(id).toEqual(socketService.socket.id);
    });

    it('get socket id should return id', () => {
        socketService.socket.id = '';
        expect(component.socketId).toEqual('');
    });

    it('onWinGame should call showPopUp', () => {
        const popUpSpy = spyOn(component, 'showPopUp');
        component.onWinGame();
        expect(popUpSpy).toHaveBeenCalled();
    });

    it('socketService informs user about differences', () => {
        const fakeData = {
            foundDifferences: [true, true, true],
            isValidated: true,
            foundDifferenceIndex: 0,
        };
        component.totalDifferences = 3;
        component.foundDifferences = fakeData.foundDifferences;
        component.onWinGame = jasmine.createSpy('onWinGame');
        component.onFindDifference = jasmine.createSpy('onFindDifference');

        socketService.on.and.callFake((eventName: string, callback) => {
            if (eventName === 'validationReturned') {
                callback(fakeData as any);
            }
        });

        component.addServerSocketMessagesListeners();
        expect(component.onFindDifference).toHaveBeenCalled();
        expect(component.onWinGame).not.toHaveBeenCalled();
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
        // expect(component.title).toEqual('test');
    });
    it('should display the error message and disable pointer events on the canvases', () => {
        const canvas = document.createElement('canvas');
        component.leftCanvas = { nativeElement: canvas };
        component.rightCanvas = { nativeElement: canvas };
        component.onFindWrongDifference();

        expect(component.errorMessage.nativeElement.style.display).toBe('block');
        expect(component.leftCanvas.nativeElement.style.pointerEvents).toBe('none');
        expect(component.rightCanvas.nativeElement.style.pointerEvents).toBe('none');
    });

    it('setTimout should be called onFindWrongDifferences', fakeAsync(() => {
        const canvas = document.createElement('canvas');
        component.leftCanvas = { nativeElement: canvas };
        component.rightCanvas = { nativeElement: canvas };
        component.onFindWrongDifference();
        tick(1000);
        expect(component.errorMessage.nativeElement.style.display).toBe('none');
        expect(component.leftCanvas.nativeElement.style.pointerEvents).toBe('auto');
        expect(component.rightCanvas.nativeElement.style.pointerEvents).toBe('auto');
    }));
});
