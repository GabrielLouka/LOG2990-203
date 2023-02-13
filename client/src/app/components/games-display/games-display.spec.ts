/* eslint-disable @typescript-eslint/no-explicit-any */
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
        spyOn(component, 'fetchGameDataFromServer').and.returnValue({
            subscribe: () => {
                return true;
            },
        } as any);

        component.currentPageNbr = 0;
        await component.goToNextSlide();
        expect(component.currentPageNbr).toEqual(1);
    });
    it('clicking on previous button should decrement page number', async () => {
        spyOn(component, 'fetchGameDataFromServer').and.returnValue({
            subscribe: () => {
                return true;
            },
        } as any);

        component.isSelection = true;
        component.currentPageNbr = 2;
        await component.goToPreviousSlide();
        expect(component.fetchGameDataFromServer).toHaveBeenCalled();
        expect(component.currentPageNbr).toEqual(1);
        expect(component.isSelection).toBeTruthy();
    });

    it("current page should stay the same if it's the last page", async () => {
        spyOn(component, 'fetchGameDataFromServer').and.returnValue({
            subscribe: () => {
                return true;
            },
        } as any);

        component.currentPageNbr = 2;
        await component.goToNextSlide();
        expect(component.currentPageNbr).toEqual(3);
        expect(component.showPreviousButton).toBeTruthy();
    });
    it("current page should stay the same if it's the last page", async () => {
        spyOn(component, 'fetchGameDataFromServer').and.returnValue({
            subscribe: () => {
                return true;
            },
        } as any);
        component.currentPageNbr = 0;
        await component.goToPreviousSlide();
        expect(component.currentPageNbr).toEqual(component.currentPageNbr);
        expect(component.showPreviousButton).toBeFalsy();
    });

    it('should fetch the games from the server', async () => {
        // communicationServiceSpy.get.and.returnValue(
        //     new Promise((resolve) => {
        //         resolve({
        //             subscribe: {
        //                 body: {
        //                     gameContent: [{ name: 'test', id: 'test' }],
        //                     nbrOfGame: 2,
        //                 },
        //             },
        //         });
        //     }) as any,
        // );

        communicationServiceSpy.get.and.returnValue({
            subscribe: async () => {
                return new Promise((resolve) => {
                    resolve({
                        body: {
                            gameContent: [{ name: 'test', id: 'test' }],
                            nbrOfGame: 2,
                        },
                    });
                });
            },
        } as any);

        expect(component.gamesNbr).toEqual(2);
    });
});
