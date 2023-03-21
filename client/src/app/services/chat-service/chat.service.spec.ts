// import { MatchmakingService } from '../matchmaking-service/matchmaking.service';
// import { SocketClientService } from '../socket-client-service/socket-client.service';

import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatchmakingService } from '@app/services/matchmaking-service/matchmaking.service';
import { SocketClientService } from '@app/services/socket-client-service/socket-client.service';
import { ChatService } from './chat.service';

describe('ChatService', () => {
    let chatService: ChatService;
    let socketServiceSpy: jasmine.SpyObj<SocketClientService>;
    let matchmakingService: MatchmakingService;

    beforeEach(() => {
        const spy = jasmine.createSpyObj('SocketClientService', ['socket']);
    
        TestBed.configureTestingModule({
          providers: [
            ChatService,
            {
              provide: SocketClientService,
              useValue: spy
            },
            {
              provide: MatchmakingService,
              useValue: jasmine.createSpyObj('MatchmakingService', ['player1Id', 'player1Username', 'player2Username', 'is1vs1Mode'])
            }
          ]
        });
        chatService = TestBed.inject(ChatService);
        socketServiceSpy = TestBed.inject(SocketClientService) as jasmine.SpyObj<SocketClientService>;
        matchmakingService = TestBed.inject(MatchmakingService) as jasmine.SpyObj<MatchmakingService>;
      });

    it("sendMessageFromSystem", () => {
        const chatElements = {
            message: 'Hello world!',
            chat: new ElementRef(document.createElement('div')),
            newMessage: ''
        };
        const messages: string | any[] = [];
        
        chatService.sendMessageFromSystem(chatElements, messages);
        
        expect(messages.length).toBe(1);
        expect(messages[0].text).toBe('Hello world!');
        expect(messages[0].username).toBe('System');
        expect(messages[0].sentBySystem).toBe(true);
        expect(messages[0].sentByPlayer1).toBe(false);
        expect(messages[0].sentByPlayer2).toBe(false);
        expect(typeof messages[0].sentTime).toBe('number');


    });

    it("isPlayer1 getter", () => {
      chatService.isPlayer1;
      matchmakingService.player1Id;
      socketServiceSpy.socketId;
      expect(chatService.isPlayer1)
    });

    it("is 1v1 getter", () => {
      chatService.isMode1vs1;
      matchmakingService.is1vs1Mode;
      expect(chatService.isMode1vs1).toBeTruthy();
    });

    it('should return false when the message is empty', () => {
      expect(chatService.isTextValid('')).toBe(false);
    });

    it('should return false when the message is only whitespace', () => {
      expect(chatService.isTextValid('   ')).toBe(false);
    });

    it('should return true when the message contains non-whitespace characters', () => {
      expect(chatService.isTextValid('Hello, world!')).toBe(true);
    });

    it('should send a message if the text is valid', () => {
      const isPlayer1 = true;
      const newMessage = 'hello world';
      chatService.sendMessage(isPlayer1, newMessage);
      
      expect(socketServiceSpy.socket.emit).toHaveBeenCalledWith('sendingMessage', {
        message: newMessage,
        username: 'player1',
        sentByPlayer1: true,
      });
    });
    
});
