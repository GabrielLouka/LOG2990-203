/* eslint-disable no-restricted-imports */
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { MatchmakingService } from '@app/services/matchmaking-service/matchmaking.service';
import { SocketClientService } from '@app/services/socket-client-service/socket-client.service';
import { MatchType } from '@common/enums/match-type';
import { of } from 'rxjs';
import { DeleteGamesPopUpComponent } from '../delete-games-pop-up/delete-games-pop-up.component';
import { OverlayComponent } from './overlay.component';

describe('OverlayComponent', () => {
    let component: OverlayComponent;
    let fixture: ComponentFixture<OverlayComponent>;
    let matchmakingServiceSpy: jasmine.SpyObj<MatchmakingService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let socketServiceSpy: jasmine.SpyObj<SocketClientService>;
    let communicationServiceSpy: jasmine.SpyObj<CommunicationService>;
    let popUpElementSpy: jasmine.SpyObj<DeleteGamesPopUpComponent>;
    let locationSpy: jasmine.SpyObj<Location>;
    beforeEach(() => {
        matchmakingServiceSpy = jasmine.createSpyObj('MatchmakingService', ['createGame', 'joinGame']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        socketServiceSpy = jasmine.createSpyObj('SocketClientService', ['emit']);
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['delete']);

        popUpElementSpy = jasmine.createSpyObj('DeleteGamesPopUpComponent', ['showPopUp']);
        locationSpy = jasmine.createSpyObj('Location', ['reload']);
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [OverlayComponent],
            providers: [
                { provide: MatchmakingService, useValue: matchmakingServiceSpy },
                { provide: Router, useValue: routerSpy },
                { provide: SocketClientService, useValue: socketServiceSpy },
                { provide: CommunicationService, useValue: communicationServiceSpy },
                { provide: Location, useValue: locationSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(OverlayComponent);
        component = fixture.componentInstance;
        component.id = 'game_id_123';
        component.deletePopUpElement = popUpElementSpy;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should create a OneVersusOne game and navigate to the registration page', () => {
        component.createOneVersusOneGame();

        expect(matchmakingServiceSpy.createGame).toHaveBeenCalledWith('game_id_123');
        expect(matchmakingServiceSpy.currentMatchType).toEqual(MatchType.OneVersusOne);
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/registration', 'game_id_123']);
    });

    it('should create a Solo game and navigate to the registration page', () => {
        component.createSoloGame();

        expect(matchmakingServiceSpy.createGame).toHaveBeenCalledWith('game_id_123');
        expect(matchmakingServiceSpy.currentMatchType).toEqual(MatchType.Solo);
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/registration', 'game_id_123']);
    });

    it('should not join a game if no match is available', () => {
        component.joinGame();

        expect(matchmakingServiceSpy.joinGame).not.toHaveBeenCalled();
        expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('should join a game and navigate to the registration page', () => {
        component.matchToJoinIfAvailable = 'match_id_123';

        component.joinGame();

        expect(matchmakingServiceSpy.joinGame).toHaveBeenCalledWith('match_id_123');
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/registration', 'game_id_123']);
    });

    it('should call showDeleteGamesPopUp function of popUpElement with false argument', () => {
        component.deletePopUpElement = new DeleteGamesPopUpComponent();
        spyOn(component.deletePopUpElement, 'showPopUp');
        component.showDeletePopUp();
        expect(component.deletePopUpElement.showPopUp).toHaveBeenCalled();
    });

    it('should delete selected game', async () => {
        // Mock successful response from the communication service
        communicationServiceSpy.delete.and.returnValue(
            of({
                headers: new HttpHeaders(),
                status: 200,
                statusText: 'OK',
                url: '',
                body: 'body',
                type: 4,
                ok: true,
                clone: (): HttpResponse<string> => new HttpResponse<string>(undefined),
            }),
        );
        socketServiceSpy.socket = jasmine.createSpyObj('Socket', ['emit']);
        spyOn(component, 'reloadPage').and.stub();
        await component.deleteSelectedGame(true);
    });
});
