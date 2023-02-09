import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BackButtonComponent } from '@app/components/back-button/back-button.component';
import { GameCardComponent } from '@app/components/game-card/game-card.component';
import { NextPageButtonComponent } from '@app/components/next-page-button/next-page-button.component';
import { PreviousPageButtonComponent } from '@app/components/previous-page-button/previous-page-button.component';
import { GamesDisplayComponent } from './games-display.component';

describe('GamesDisplayComponent', () => {
    let component: GamesDisplayComponent;
    let fixture: ComponentFixture<GamesDisplayComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GamesDisplayComponent, BackButtonComponent, GameCardComponent, NextPageButtonComponent, PreviousPageButtonComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(GamesDisplayComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('clicking on next button should increment page number', () => {
        component.currentPageNbr = 0;
        component.goToNextSlide();
        expect(component.currentPageNbr).toEqual(1);
    });

    it('clicking on previous button should decrement page number', () => {
        component.currentPageNbr = 2;
        component.goToPreviousSlide();
        expect(component.currentPageNbr).toEqual(1);
    });

    it("current page should stay the same if it's the last page", () => {
        component.currentPageNbr = 2;
        component.goToNextSlide();
        expect(component.currentPageNbr).toEqual(component.currentPageNbr);
    });
    it("current page should stay the same if it's the last page", () => {
        component.currentPageNbr = 0;
        component.goToPreviousSlide();
        expect(component.currentPageNbr).toEqual(component.currentPageNbr);
    });
});
