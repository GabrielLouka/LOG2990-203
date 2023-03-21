// import { MatchmakingService } from '../matchmaking-service/matchmaking.service';
// import { SocketClientService } from '../socket-client-service/socket-client.service';

import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatchmakingService } from '@app/services/matchmaking-service/matchmaking.service';
import { SocketClientService } from '@app/services/socket-client-service/socket-client.service';
import { ChatService } from './chat.service';

describe('ChatService', () => {
    let service: ChatService;
    let socketService: jasmine.SpyObj<SocketClientService>;
    let matchService: jasmine.SpyObj<MatchmakingService>;

    beforeEach(() => {
        const socketSpy = jasmine.createSpyObj('SocketClientService', ['emit']);
        const matchSpy = jasmine.createSpyObj('MatchmakingService', ['player1SocketId', 'is1vs1Mode']);
        TestBed.configureTestingModule({
            providers: [
                { provide: SocketClientService, useValue: socketSpy },
                { provide: MatchmakingService, useValue: matchSpy },
            ],
        });
        service = TestBed.inject(ChatService);
        socketService = TestBed.inject(SocketClientService) as jasmine.SpyObj<SocketClientService>;
        matchService = TestBed.inject(MatchmakingService) as jasmine.SpyObj<MatchmakingService>;
        service = new ChatService(socketService, matchService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('sendMessage should send message if valid', () => {
        const message = 'hello';
        const isPlayer1 = true;
        service.sendMessage(isPlayer1, message);
        spyOn(socketService.socket, 'emit');
        expect(socketService.socket.emit).toHaveBeenCalled();
    });

    it('matchservice exists', () => {
        expect(matchService).toBeTruthy();
    });

    it("player1 getter should return if player1 from matchmaking", () => {
        service.isPlayer1;
        
    });

    it("isMode1v1", () => {
        service.isMode1vs1;
    });

    it("sendMessageFromSystem", () => {
        const chatElements = {
            message: 'Hello world!',
            chat: new ElementRef(document.createElement('div')),
            newMessage: ''
        };
        const messages: string | any[] = [];
        
        service.sendMessageFromSystem(chatElements, messages);
        
        expect(messages.length).toBe(1);
        expect(messages[0].text).toBe('Hello world!');
        expect(messages[0].username).toBe('System');
        expect(messages[0].sentBySystem).toBe(true);
        expect(messages[0].sentByPlayer1).toBe(false);
        expect(messages[0].sentByPlayer2).toBe(false);
        expect(typeof messages[0].sentTime).toBe('number');


    });
});
