import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreationResultModalComponent } from './creation-result-modal.component';

describe('CreationResultModalComponent', () => {
    let component: CreationResultModalComponent;
    let fixture: ComponentFixture<CreationResultModalComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CreationResultModalComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(CreationResultModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
