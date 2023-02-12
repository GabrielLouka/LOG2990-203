/* eslint-disable deprecation/deprecation */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommunicationService } from '@app/services/communication.service';
import { GameData } from '@common/game-data';
import { GamesDisplayComponent } from './games-display.component';

describe('GamesDisplayComponent', () => {
    let component: GamesDisplayComponent;
    let fixture: ComponentFixture<GamesDisplayComponent>;
    let communicationService: CommunicationService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [GamesDisplayComponent],
            providers: [CommunicationService],
        });

        fixture = TestBed.createComponent(GamesDisplayComponent);
        component = fixture.componentInstance;
        communicationService = TestBed.get(CommunicationService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set the title based on whether the component is used for selection or configuration', () => {
        component.isSelection = true;
        fixture.detectChanges();
        expect(component.title).toEqual('Page de configuration ');

        component.isSelection = false;
        fixture.detectChanges();
        expect(component.title).toEqual('Page de selection');
    });

    it('should get games from the server', () => {
        spyOn(communicationService, 'get').and.returnValue({
            subscribe: ((callback) => {
                callback({ body: JSON.stringify({ gameContent: [{ gameData: {} as GameData, originalImage: new ArrayBuffer(0) }], nbrOfGame: 1 }) });
            }as any),
        });
        component.ngOnInit();

        expect(communicationService.get).toHaveBeenCalledWith('/games/0');
        expect(component.games.length).toEqual(1);
    });

    it('should show or hide the next button based on the number of games', () => {
        component.ngOnInit();
        component.gamesNbr = 3;
        component.currentPageNbr = 0;
        fixture.detectChanges();
        expect(component.showNextButton).toBeTruthy();

        component.currentPageNbr = 1;
        fixture.detectChanges();
        expect(component.showNextButton).toBeFalsy();
    });

    it('should show or hide the previous button based on the current page number', () => {
        component.ngOnInit();
        component.currentPageNbr = 1;
        fixture.detectChanges();
        expect(component.showPreviousButton).toBeTruthy();

        component.currentPageNbr = 0;
        fixture.detectChanges();
        expect(component.showPreviousButton).toBeFalsy();
    });
});
