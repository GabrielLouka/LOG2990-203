import { TestBed } from '@angular/core/testing';
import { MatchmakingService } from '../matchmaking-service/matchmaking.service';
import { SocketClientService } from '../socket-client-service/socket-client.service';

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
        ChatService, {provide: SocketClientService, useValue: socketSpy},
        MatchmakingService, {provide: MatchmakingService, useValue: matchSpy}
      ]
    });
    service = TestBed.inject(ChatService);
    socketService = TestBed.inject(SocketClientService) as jasmine.SpyObj<SocketClientService>;
    matchService = TestBed.inject(MatchmakingService) as jasmine.SpyObj<MatchmakingService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it("isPlayer1 should return if socketId is equal to player1SocketId", () => {
    

  });

  it("isMode1v1 should return matchmaking status", () => {
    


  });


});
