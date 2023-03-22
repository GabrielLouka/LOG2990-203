/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
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
    let socketTestHelper: SocketTestHelper;
    let socketServiceMock: SocketClientServiceMock;

    const routerMock = {
        navigate: jasmine.createSpy('navigate'),
    };
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
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: { paramMap: convertToParamMap({ id: '1' }) },
                    },
                },
                {
                    provide: Router,
                    useValue: routerMock,
                },
            ],
        }).compileComponents();
        service = TestBed.inject(RegistrationService);
    }));

    afterEach(() => {
        socketServiceMock.disconnect();
        socketTestHelper.disconnect();
    });

    it('should create the service', () => {
        expect(service).toBeTruthy();
    });

    it('should redirect to main page', () => {
        service.redirectToMainPage();
    });

    it('should handle game deletion', () => {
        service.handleGameDeleted('1');
    });

    it('should handle game deletion for a null value ', () => {
        service.handleGameDeleted(null);
        expect(routerMock.navigate).toHaveBeenCalled();
    });

    it('should load the game page', () => {
        const id = '1';
        service.loadGamePage(id);
        expect(routerMock.navigate).toHaveBeenCalled();
    });
});
