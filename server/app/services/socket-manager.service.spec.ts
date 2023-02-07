import { expect } from 'chai';
import * as http from 'http';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import * as io from 'socket.io';
import { MatchingDifferencesService } from './matching-differences.service';
import { SocketManager } from './socket-manager.service';


describe("SocketManager service", () => {
    let socketService: SocketManager;
    let httpInstance: SinonStubbedInstance<http.Server>
    let matchingService: SinonStubbedInstance<MatchingDifferencesService>;
    
    beforeEach(async () => {
        httpInstance = createStubInstance(http.Server);
        matchingService = createStubInstance(MatchingDifferencesService);
        socketService = new SocketManager(httpInstance);
        socketService.matchingDifferencesService = matchingService;
        
    });

    it("SocketManager constructor should include http.server", () => {
        const sioInstance = new io.Server(httpInstance, { cors: { origin: '*', methods: ['GET', 'POST'] } });
        expect(socketService['sio']).to.equal(sioInstance);
        expect(socketService.matchingDifferencesService).to.equal(matchingService);
        
    });

    it("socket should emit hello message to client upon creation", () => {
        socketService.handleSockets();
    });

});