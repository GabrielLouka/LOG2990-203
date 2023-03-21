// import { MatchmakingService } from '../matchmaking-service/matchmaking.service';
// import { SocketClientService } from '../socket-client-service/socket-client.service';

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
});
