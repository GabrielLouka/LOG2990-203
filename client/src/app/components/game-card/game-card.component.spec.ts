import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverlayComponent } from '@app/components/overlay/overlay.component';
import { GameCardComponent } from './game-card.component';

describe('GameCardComponent', () => {
    let component: GameCardComponent;
    let fixture: ComponentFixture<GameCardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameCardComponent, OverlayComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(GameCardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return green when difficulty is FACILE', () => {
        const game = { difficulty: 'FACILE' };
        expect(component.getDifficultyColor(game)).toBe('green');
    });

    it('should return red when difficulty is DIFFICILE', () => {
        const game = { difficulty: 'DIFFICILE' };
        expect(component.getDifficultyColor(game)).toBe('red');
    });

    it('should return black when difficulty is unknown', () => {
        const game = { difficulty: 'unknown' };
        expect(component.getDifficultyColor(game)).toBe('black');
    });
});
