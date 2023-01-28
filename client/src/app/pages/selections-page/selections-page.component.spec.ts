import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackButtonComponent } from '@app/components/back-button/back-button.component';
import { GameCardComponent } from '@app/components/game-card/game-card.component';
import { NextPageButtonComponent } from '@app/components/next-page-button/next-page-button.component';
import { PreviousPageButtonComponent } from '@app/components/previous-page-button/previous-page-button.component';
import { SelectionsPageComponent } from './selections-page.component';

describe('SelectionsPageComponent', () => {
    let component: SelectionsPageComponent;
    let fixture: ComponentFixture<SelectionsPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SelectionsPageComponent, BackButtonComponent, GameCardComponent, NextPageButtonComponent, PreviousPageButtonComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(SelectionsPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
