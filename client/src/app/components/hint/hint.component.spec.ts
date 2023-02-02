import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HintComponent } from './hint.component';

describe('HintComponent', () => {
    let component: HintComponent;
    let fixture: ComponentFixture<HintComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [HintComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(HintComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    let maxGivenHints: number;

    beforeEach(() => {
        maxGivenHints = 3;
    });

    it('should decrement the number of hints', () => {
        component.giveHint();
        expect(maxGivenHints).toBe(2);
    });

    it('should alert when all hints are used', () => {
        maxGivenHints = 0;
        const spy = spyOn(window, 'alert');

        component.giveHint();

        expect(spy).toHaveBeenCalledWith('Vous avez utilisé vos indices !');
    });
});
