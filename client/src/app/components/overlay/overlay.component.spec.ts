/* eslint-disable no-restricted-imports */
import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { MatchmakingService } from '@app/services/matchmaking-service/matchmaking.service';
import { MatchType } from '@common/enums/match-type';
import { DeleteGamesPopUpComponent } from '../delete-games-pop-up/delete-games-pop-up.component';
import { OverlayComponent } from './overlay.component';

describe('OverlayComponent', () => {
    let communicationServiceSpy: jasmine.SpyObj<CommunicationService>;
    let component: OverlayComponent;
    let fixture: ComponentFixture<OverlayComponent>;
    let matchmakingServiceSpy: jasmine.SpyObj<MatchmakingService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let popUpElementSpy: jasmine.SpyObj<DeleteGamesPopUpComponent>;
    let locationSpy: jasmine.SpyObj<Location>;

    beforeEach(() => {
        matchmakingServiceSpy = jasmine.createSpyObj('MatchmakingService', ['createGame', 'joinGame']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        popUpElementSpy = jasmine.createSpyObj('DeleteGamesPopUpComponent', ['showDeleteGamesPopUp']);
        locationSpy = jasmine.createSpyObj('Location', ['reload']);

        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [OverlayComponent],
            providers: [
                { provide: CommunicationService, useValue: communicationServiceSpy },
                { provide: MatchmakingService, useValue: matchmakingServiceSpy },
                HttpClient,
                { provide: Router, useValue: routerSpy },
                { provide: Location, useValue: locationSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(OverlayComponent);
        component = fixture.componentInstance;
        component.id = 'game_id_123';
        component.popUpElement = popUpElementSpy;
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
        component.popUpElement = new DeleteGamesPopUpComponent();
        spyOn(component.popUpElement, 'showDeleteGamesPopUp');
        component.showDeletePopUp();
        expect(component.popUpElement.showDeleteGamesPopUp).toHaveBeenCalled();
    });
});
