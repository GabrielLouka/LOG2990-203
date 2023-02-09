// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { BackButtonComponent } from '@app/components/back-button/back-button.component';
// import { GameCardComponent } from '@app/components/game-card/game-card.component';
// import { NextPageButtonComponent } from '@app/components/next-page-button/next-page-button.component';
// import { PreviousPageButtonComponent } from '@app/components/previous-page-button/previous-page-button.component';
// import { Game } from '@app/interfaces/games';
// import { SelectionsPageComponent } from './selections-page.component';

// describe('SelectionsPageComponent', () => {
//     let component: SelectionsPageComponent;
//     let fixture: ComponentFixture<SelectionsPageComponent>;

//     beforeEach(async () => {
//         await TestBed.configureTestingModule({
//             declarations: [SelectionsPageComponent, BackButtonComponent, GameCardComponent, NextPageButtonComponent, PreviousPageButtonComponent],
//         }).compileComponents();

//         fixture = TestBed.createComponent(SelectionsPageComponent);
//         component = fixture.componentInstance;
//         fixture.detectChanges();
//         const game1: Game[] = [];
//         const game2: Game[] = [];
//         const game3: Game[] = [];
//         component.games = [game1, game2, game3];
//     });

//     it('should create', () => {
//         expect(component).toBeTruthy();
//     });
//     it('clicking on next button should increment page number', () => {
//         component.currentIndex = 0;
//         component.goToNextSlide();
//         expect(component.currentIndex).toEqual(1);
//     });

//     it('clicking on previous button should decrement page number', () => {
//         component.currentIndex = 2;
//         component.goToPreviousSlide();
//         expect(component.currentIndex).toEqual(1);
//     });

//     it("current page should stay the same if it's the last page", () => {
//         component.currentIndex = 2;
//         component.goToNextSlide();
//         expect(component.currentIndex).toEqual(component.currentIndex);
//     });
//     it("current page should stay the same if it's the last page", () => {
//         component.currentIndex = 0;
//         component.goToPreviousSlide();
//         expect(component.currentIndex).toEqual(component.currentIndex);
//     });
// });
