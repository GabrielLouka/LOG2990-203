import { HttpResponse } from '@angular/common/http';
import { ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { BackButtonComponent } from '@app/components/back-button/back-button.component';
import { ChatComponent } from '@app/components/chat/chat.component';
import { HintComponent } from '@app/components/hint/hint.component';
import { InfoCardComponent } from '@app/components/info-card/info-card.component';
import { AuthService } from '@app/services/auth.service';
import { CommunicationService } from '@app/services/communication.service';
import { ImageManipulationService } from '@app/services/image-manipulation.service';
import { SocketClientService } from '@app/services/socket-client.service';
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
    let chat: jasmine.SpyObj<ChatComponent>;

    const mockResponse: HttpResponse<string> = new HttpResponse({
        status: 200,
        body: 'mock response',
    });
    const mockObservable = of(mockResponse);

    beforeEach(() => {
        socketService = jasmine.createSpyObj('SocketClientService', ['isSocketAlive', 'connect', 'disconnect', 'on', 'send']);
        commService = jasmine.createSpyObj('CommunicationService', ['basicGet', 'basicPost', 'get', 'post', 'delete']);
        authService = jasmine.createSpyObj('AuthService', ['registerUser', 'registerUserName']);
        imageService = jasmine.createSpyObj('ImageManipulationService', [
            'getModifiedImageWithoutDifferences',
            'blinkDifference',
            'sleep',
            'loadCanvasImages',
        ]);

        leftCanvas = jasmine.createSpyObj('nativeElement', ['getContext']);
        rightCanvas = jasmine.createSpyObj('nativeElement', ['getContext']);
        chat = jasmine.createSpyObj('ChatComponent', ['sendMessage', 'addMessage']);

        commService.get.and.returnValue(mockObservable);
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ClassicPageComponent, HintComponent, BackButtonComponent, InfoCardComponent],
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
                { provide: ElementRef, useValue: leftCanvas },
                { provide: ElementRef, useValue: rightCanvas },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ClassicPageComponent);
        component = fixture.componentInstance;
        fixture.componentInstance.timeInSeconds = 0;
        fixture.componentInstance.leftCanvas = leftCanvas;
        fixture.componentInstance.rightCanvas = rightCanvas;
        fixture.componentInstance.chat = chat;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('socketId should return id if valid, otherwise empty string', () => {
        if (socketService.socket.id) expect(component.socketId).toEqual(socketService.socket.id);
        else expect(component.socketId).toEqual('');
    });

    it('addMessageToChat should add message to chat', () => {
        const message = 'hello';
        component.chat.addMessage(message);
        expect(component.chat).toContain(message);
    });

    it('onWinGame should add message to chat', () => {
        const messageSpy = spyOn(component, 'addMessageToChat');
        component.onWinGame();
        expect(messageSpy).toHaveBeenCalledWith('Damn, you are goated');
    });

    it('onWinGame should disconnect', () => {
        component.onWinGame();
        expect(socketService.disconnect).toHaveBeenCalled();
    });
});
