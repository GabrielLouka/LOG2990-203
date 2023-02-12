// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { Game } from '@app/interfaces/games';

// import { OverlayComponent } from '@app/components/overlay/overlay.component';
// import { GameCardComponent } from './game-card.component';

// describe('GameCardComponent', () => {
//     let component: GameCardComponent;
//     let fixture: ComponentFixture<GameCardComponent>;
//     const game: Game = {
//         description: 'Glouton',
//         image: '.\\assets\\img\\game-icon.png',
//         difficulty: 'DIFFICILE',
//         ranking: [
//             [
//                 { name: 'gabriel', score: '05:30' },
//                 { name: 'gabriel', score: '05:30' },
//                 { name: 'gabriel', score: '05:30' },
//             ],
//             [
//                 { name: 'gabriel', score: '05:30' },
//                 { name: 'gabriel', score: '05:30' },
//                 { name: 'gabriel', score: '05:30' },
//             ],
//         ],
//     };

//     beforeEach(async () => {
//         await TestBed.configureTestingModule({
//             declarations: [GameCardComponent, OverlayComponent],
//         }).compileComponents();

//         fixture = TestBed.createComponent(GameCardComponent);
//         component = fixture.componentInstance;
//         fixture.detectChanges();
//     });

//     it('should create', () => {
//         expect(component).toBeTruthy();
//     });

//     it('should return green when difficulty is FACILE', () => {
//         game.difficulty = 'FACILE';
//         expect(component.getDifficultyColor(game)).toBe('green');
//     });

//     it('should return red when difficulty is DIFFICILE', () => {
//         game.difficulty = 'DIFFICILE';
//         expect(component.getDifficultyColor(game)).toBe('red');
//     });

//     it('should return black when difficulty is unknown', () => {
//         game.difficulty = 'MEDIUM';
//         expect(component.getDifficultyColor(game)).toBe('black');
//     });
// });
