import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BackButtonComponent } from '@app/components/back-button/back-button.component';
import { GameCardComponent } from '@app/components/game-card/game-card.component';
import { NextPageButtonComponent } from '@app/components/next-page-button/next-page-button.component';
import { PreviousPageButtonComponent } from '@app/components/previous-page-button/previous-page-button.component';
import { Game } from '@app/interfaces/games';
import { CommunicationService } from '@app/services/communication.service';
import { SelectionsPageComponent } from './selections-page.component';

describe('SelectionsPageComponent', () => {
    let component: SelectionsPageComponent;
    let fixture: ComponentFixture<SelectionsPageComponent>;
    let commService: jasmine.SpyObj<CommunicationService>;

    beforeEach(() => {
        commService = jasmine.createSpyObj('CommunicationService', ['basicGet', 'basicPort', 'get', 'post']);
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SelectionsPageComponent, BackButtonComponent, GameCardComponent, NextPageButtonComponent, PreviousPageButtonComponent],
            providers: [{provide: CommunicationService, useValue: commService}]
        }).compileComponents();

        fixture = TestBed.createComponent(SelectionsPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        const game1: Game[] = [];
        const game2: Game[] = [];
        const game3: Game[] = [];
        component.games = [game1, game2, game3];
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it("goToNextSlide should go to next group of games", async() => {
        await component.goToNextSlide();
        expect(component.currentPageNbr).toEqual(Math.ceil(component.gameNbr / 4));
    });

    it('clicking on next button should increment page number', async() => {
        component.currentPageNbr = 0;
        await component.goToNextSlide();
        expect(component.currentPageNbr).toEqual(1);
    });

    it('clicking on previous button should decrement page number', async() => {
        component.currentPageNbr = 2;
        await component.goToPreviousSlide();
        expect(component.currentPageNbr).toEqual(1);
    });

    it("current page should stay the same if it's the last page", async() => {
        component.currentPageNbr = 2;
        await component.goToNextSlide();
        expect(component.currentPageNbr).toEqual(component.currentPageNbr);
    });
    
    it("current page should stay the same if it's the last page", async() => {
        component.currentPageNbr = 0;
        await component.goToPreviousSlide();
        expect(component.currentPageNbr).toEqual(component.currentPageNbr);
    });

    
    
    
});
