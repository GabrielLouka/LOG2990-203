/* eslint-disable no-unused-vars */
import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CommunicationService } from '@app/services/communication.service';
import { GamesDisplayComponent } from './games-display.component';
import SpyObj = jasmine.SpyObj;
describe('GamesDisplayComponent', () => {
    let component: GamesDisplayComponent;
    let fixture: ComponentFixture<GamesDisplayComponent>;
    let communicationServiceSpy: SpyObj<CommunicationService>;
    beforeEach(() => {
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['basicGet', 'basicPost', 'get', 'post', 'delete', 'handleError']);
    });
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [GamesDisplayComponent],
            providers: [{ provide: CommunicationService, useValue: communicationServiceSpy }, HttpClient],
        }).compileComponents();
    }));
    beforeEach(() => {
        fixture = TestBed.createComponent(GamesDisplayComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('clicking on next button should increment page number', async () => {
        component.currentPageNbr = 0;
        await component.goToNextSlide();
        expect(component.currentPageNbr).toEqual(1);
    });
    it('clicking on previous button should decrement page number', async () => {
        component.isSelection = true;
        component.currentPageNbr = 2;
        await component.goToPreviousSlide();
        expect(component.getGames).toHaveBeenCalled();
        expect(component.currentPageNbr).toEqual(1);
        expect(component.isSelection).toBeTruthy();
    });

    it("current page should stay the same if it's the last page", async () => {
        component.currentPageNbr = 2;
        await component.goToNextSlide();
        expect(component.currentPageNbr).toEqual(3);
        expect(component.showPreviousButton).toBeTruthy();
    });
    it("current page should stay the same if it's the last page", async () => {
        component.currentPageNbr = 0;
        await component.goToPreviousSlide();
        expect(component.currentPageNbr).toEqual(component.currentPageNbr);
        expect(component.showPreviousButton).toBeFalsy();
    });
});
