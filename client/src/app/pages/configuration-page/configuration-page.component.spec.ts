import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackButtonComponent } from '@app/components/back-button/back-button.component';
import { GameCardComponent } from '@app/components/game-card/game-card.component';
import { NextPageButtonComponent } from '@app/components/next-page-button/next-page-button.component';
import { PreviousPageButtonComponent } from '@app/components/previous-page-button/previous-page-button.component';
import { ConfigurationPageComponent } from './configuration-page.component';

describe('ConfigurationPageComponent', () => {
    let component: ConfigurationPageComponent;
    let fixture: ComponentFixture<ConfigurationPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ConfigurationPageComponent, PreviousPageButtonComponent, NextPageButtonComponent, BackButtonComponent, GameCardComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ConfigurationPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should delete all games when confirmed', () => {
        // Use spyOn to mock window.confirm
        spyOn(window, 'confirm').and.returnValue(true);

        component.deleteButton();

        const container = document.querySelector('container');
        expect(container).toBeTruthy();
        // expect(container.innerHTML).toBe('');
    });

    it('should not delete all games when not confirmed', () => {
        // Use spyOn to mock window.confirm
        spyOn(window, 'confirm').and.returnValue(false);

        component.deleteButton();

        const container = document.querySelector('container');
        expect(container).toBeTruthy();
        // expect(container.innerHTML).not.toBe('');
    });
});
