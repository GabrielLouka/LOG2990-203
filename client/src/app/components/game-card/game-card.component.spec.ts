import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { GameData } from '@common/interfaces/game-data';
import { Buffer } from 'buffer';

import { OverlayComponent } from '@app/components/overlay/overlay.component';
import { GameCardComponent } from './game-card.component';

describe('GameCardComponent', () => {
    let component: GameCardComponent;
    let fixture: ComponentFixture<GameCardComponent>;
    const gameTest: GameData = {
        id: 0,
        name: 'gametest',
        isEasy: true,
        nbrDifferences: 1,
        differences: [[{ x: 0, y: 0 }]],
        ranking: [[{ name: 'name', score: '1' }]],
    };
    const imageBuffer: Buffer = Buffer.alloc(3);

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [GameCardComponent, OverlayComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GameCardComponent);
        component = fixture.componentInstance;
        fixture.componentInstance.game = { gameData: gameTest, originalImage: imageBuffer, matchToJoinIfAvailable: null };
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('getDifficulty should return green if easy', () => {
        component.game.gameData.isEasy = true;
        const colour = component.getDifficultyColor();
        expect(colour).toEqual('green');
    });

    it('getDifficulty should return red if difficult', () => {
        component.game.gameData.isEasy = false;
        const colour = component.getDifficultyColor();
        expect(colour).toEqual('red');
    });

    it('this.difficulty should be Difficile if easy is false', () => {
        const test: GameData = {
            id: 0,
            name: 'gametest',
            isEasy: false,
            nbrDifferences: 1,
            differences: [[{ x: 0, y: 0 }]],
            ranking: [[{ name: 'name', score: '1' }]],
        };
        const difficulty = test.isEasy ? 'Facile' : 'Difficile';
        expect(difficulty).toEqual('Difficile');
    });
});
