import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoIconComponent } from './info-card.component';

describe('InfoIconComponent', () => {
    let component: InfoIconComponent;
    let fixture: ComponentFixture<InfoIconComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [InfoIconComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(InfoIconComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
