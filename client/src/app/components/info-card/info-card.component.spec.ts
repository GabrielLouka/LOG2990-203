import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InfoCardComponent } from './info-card.component';

describe('InfoIconComponent', () => {
    let component: InfoCardComponent;
    let fixture: ComponentFixture<InfoCardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [InfoCardComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(InfoCardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return "Difficile" when isEasy is false', () => {
        component.isEasy = false;
        expect(component.getDifficulty()).toEqual('Difficile');
    });
});
