/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { TestBed, waitForAsync } from '@angular/core/testing';
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
    let service: RegistrationService;
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
    });

    beforeEach(waitForAsync(() => {
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
        }).compileComponents();
        service = TestBed.inject(RegistrationService);
        socketClientService = TestBed.inject(SocketClientService);
    }));

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
        spyOn(socketClientService, 'on').and.callThrough();
        const callback = ((params: any) => {}) as any;
        // Object.defineProperty(window, 'location', {
        //     value: {
        //         href: 'http://example.com/some-page/gamePage1',
        //     },
        //     writable: true,
        // });
        socketTestHelper.on('gameDeleted', callback);

        const data: { hasDeletedGame: boolean; id: string } = { hasDeletedGame: true, id: 'gamePage1' };
        //spyOnProperty(window.location.href.split('/')[window.location.href.split('/').length - 2], ).and.returnValue(10);
        service.signalRedirectionOneGame();
        socketTestHelper.peerSideEmit('gameDeleted', data);
        expect(socketClientService.on).toHaveBeenCalledWith('gameDeleted', jasmine.any(Function));
    });

    it('should redirect when the game is deleted', () => {
        spyOn(socketClientService, 'on').and.callThrough();
        const callback = ((params: any) => {}) as any;
        // Object.defineProperty(window, 'location', {
        //     value: {
        //         href: 'http://example.com/some-page/gamePage1',
        //     },
        //     writable: true,
        // });
        socketTestHelper.on('allGameDeleted', callback);
        const data: { hasDeletedGame: boolean; id: string } = { hasDeletedGame: true, id: 'gamePage1' };
        service.signalRedirection();
        socketTestHelper.peerSideEmit('allGameDeleted', data);
        expect(socketClientService.on).toHaveBeenCalledWith('allGameDeleted', jasmine.any(Function));
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
        registrationService.signalRedirection();

        socketTestHelper.peerSideEmit('allGameDeleted');
        expect(socketClientService.on).toHaveBeenCalledWith('allGameDeleted', jasmine.any(Function));
    });

    it('should signal redirection when one game is deleted', () => {
        registrationService.signalRedirectionOneGame();
        expect(router.navigate).toHaveBeenCalled();
    });
});
