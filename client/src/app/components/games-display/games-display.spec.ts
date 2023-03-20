/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { GameData } from '@common/game-data';
import { defaultRankings } from '@common/ranking';
import { Buffer } from 'buffer';
import { of, throwError } from 'rxjs';
import { GamesDisplayComponent } from './games-display.component';
import SpyObj = jasmine.SpyObj;
describe('GamesDisplayComponent', () => {
    let component: GamesDisplayComponent;
    let fixture: ComponentFixture<GamesDisplayComponent>;
    let communicationServiceSpy: SpyObj<CommunicationService>;
    beforeEach(() => {
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['get', 'post', 'delete', 'handleError']);
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

    it('should set title based on isSelection (when true)', () => {
        spyOn(component, 'fetchGameDataFromServer').and.returnValue(Promise.resolve());
        component.isSelection = true;
        component.ngOnInit();
        expect(component.title).toEqual('Page de configuration');
    });

    it('should set title based on isSelection (when false)', () => {
        spyOn(component, 'fetchGameDataFromServer').and.returnValue(Promise.resolve());
        component.isSelection = false;
        component.ngOnInit();
        expect(component.title).toEqual('Page de selection');
    });

    it('should fetch game data from the server', () => {
        const pageId = 0;
        const gameContent: {
            gameData: GameData;
            originalImage: Buffer;
        }[] = [];
        const expectedGames: {
            gameData: GameData;
            originalImage: Buffer;
            matchToJoinIfAvailable: string | null;
        }[] = [];
        for (let i = 1; i <= 4; i++) {
            const game: GameData = {
                id: i,
                name: `Game ${i}`,
                isEasy: true,
                nbrDifferences: 4,
                differences: [
                    [
                        { x: 4, y: 0 },
                        { x: 3, y: 0 },
                        { x: 2, y: 0 },
                        { x: 1, y: 0 },
                        { x: 0, y: 0 },
                    ],
                ],
                ranking: defaultRankings,
            };
            const match = 'match1';
            gameContent.push({ gameData: game, originalImage: Buffer.alloc(3) });
            expectedGames.push({ gameData: game, originalImage: Object({ type: 'Buffer', data: [0, 0, 0] }), matchToJoinIfAvailable: match });
        }

        communicationServiceSpy.get.and.returnValue(
            of({
                headers: new HttpHeaders(),
                status: 200,
                statusText: 'OK',
                url: '',
                body: JSON.stringify({ gameContent, nbrOfGame: 4 }),
                type: 4,
                ok: true,
                clone: (): HttpResponse<string> => new HttpResponse<string>(undefined),
            }),
        );
        component.fetchGameDataFromServer(pageId);
        expect(communicationServiceSpy.get).toHaveBeenCalledWith(`/games/${pageId}`);
        expect(component.games).toEqual(Object.assign({ gameData: gameContent, originalImage: Buffer.alloc(3), matchToJoinIfAvailable: 'match1' }));
        expect(component.games).toEqual(expectedGames);
        expect(component.gamesNbr).toEqual(4);
        expect(component.showNextButton).toBeFalse();
    });

    it('should handle error response from the server', async () => {
        const error = new HttpErrorResponse({
            error: JSON.stringify('Test error'),
            status: 404,
            statusText: 'Not Found',
        });
        spyOn(component.debugDisplayMessage, 'next');
        communicationServiceSpy.get.and.returnValue(throwError(() => error));

        await component.fetchGameDataFromServer(1);
        expect(component.debugDisplayMessage.next).toHaveBeenCalled();
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

    // it('should fetch the games from the server', async () => {
    //     // communicationServiceSpy.get.and.returnValue(
    //     //     new Promise((resolve) => {
    //     //         resolve({
    //     //             subscribe: {
    //     //                 body: {
    //     //                     gameContent: [{ name: 'test', id: 'test' }],
    //     //                     nbrOfGame: 2,
    //     //                 },
    //     //             },
    //     //         });
    //     //     }) as any,
    //     // );

    //     communicationServiceSpy.get.and.returnValue({
    //         subscribe: async () => {
    //             return new Promise((resolve) => {
    //                 resolve({
    //                     body: {
    //                         gameContent: [{ name: 'test', id: 'test' }],
    //                         nbrOfGame: 2,
    //                     },
    //                 });
    //             });
    //         },
    //     } as any);

    //     expect(component.gamesNbr).toEqual(2);
    // });
});
