/* eslint-disable no-unused-vars */
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper/socket-test-helper';
import { SocketClientService } from '@app/services/socket-client-service/socket-client.service';
import { Socket } from 'socket.io-client';
import { RegistrationService } from './registration.service';

class SocketClientServiceMock extends SocketClientService {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    override connect() {}
}

describe('RegistrationService', () => {
    let registrationService: RegistrationService;
    let routerSpy: jasmine.SpyObj<RouterTestingModule>;
    let socketTestHelper: SocketTestHelper;
    let socketServiceMock: SocketClientServiceMock;
    let socketClientService: SocketClientService;
    let router: Router;

    beforeEach(() => {
        socketTestHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock();
        socketServiceMock.socket = socketTestHelper as unknown as Socket;
        // socketClientServiceSpy = jasmine.createSpyObj('SocketClientService', ['on', 'disconnect'], {
        //     socket: { id: 'socket3' },
        //     socketId: 'socket3',
        // });
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            providers: [
                RegistrationService,
                { provide: SocketClientService, useValue: socketServiceMock },
                {
                    provide: Router,
                    useValue: routerSpy,
                },
            ],
        });
        registrationService = TestBed.inject(RegistrationService);
    });

    afterEach(() => {
        socketServiceMock.disconnect();
        socketTestHelper.disconnect();
    });

    it('should create the service', () => {
        expect(registrationService).toBeTruthy();
    });

    it('should load the default game page if id is null', () => {
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        registrationService.loadGamePage('1');
        expect(routerSpy).toHaveBeenCalled();
    });

    it('should redirect when the game is deleted', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-function
        const callback = ((params: any) => {}) as any;
        Object.defineProperty(window, 'location', {
            value: {
                href: 'http://example.com/some-page/gamePage1',
            },
            writable: true,
        });
        socketTestHelper.on('gameDeleted', callback);
        const data: { hasDeletedGame: boolean; id: string } = { hasDeletedGame: true, id: 'gamePage1' };
        socketTestHelper.peerSideEmit('gameDeleted', data);
        registrationService.signalRedirectionOneGame();
        expect(socketClientService.on).toHaveBeenCalledWith('gameDeleted', jasmine.any(Function));
    });

    it('should redirect to main page', () => {
        registrationService.redirectToMainPage();
        expect(router).toHaveBeenCalled();
    });

    it('should load the game page', () => {
        const id = 'gamePage1';
        registrationService.loadGamePage(id);
        expect(router.navigate).toHaveBeenCalled();
    });

    it('should signal redirection when all games are deleted', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-function
        const callback = ((params: any) => {}) as any;
        Object.defineProperty(window, 'location', {
            value: {
                href: 'http://example.com/some-page/gamePage1',
            },
            writable: true,
        });
        socketTestHelper.on('allGameDeleted', callback);
        socketTestHelper.peerSideEmit('allGameDeleted');
        registrationService.signalRedirection();
        expect(socketClientService.on).toHaveBeenCalledWith('allGameDeleted', jasmine.any(Function));
    });

    it('should signal redirection when one game is deleted', () => {
        registrationService.signalRedirectionOneGame();
        expect(router.navigate).toHaveBeenCalled();
    });
});