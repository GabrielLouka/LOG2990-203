/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper/socket-test-helper';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { SocketClientService } from '@app/services/socket-client-service/socket-client.service';
import { GameData } from '@common/interfaces/game-data';
import { defaultRankings } from '@common/interfaces/ranking';
import { Buffer } from 'buffer';
import { of, throwError } from 'rxjs';
import { Socket } from 'socket.io-client';
import { GamesDisplayComponent } from './games-display.component';

import SpyObj = jasmine.SpyObj;

class SocketClientServiceMock extends SocketClientService {
    override connect() {}
}

describe('GamesDisplayComponent', () => {
    let component: GamesDisplayComponent;
    let fixture: ComponentFixture<GamesDisplayComponent>;
    let communicationServiceSpy: SpyObj<CommunicationService>;
    let socketClientService: SocketClientService;
    let socketTestHelper: SocketTestHelper;
    let socketServiceMock: SocketClientServiceMock;
    beforeEach(() => {
        socketTestHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock();
        socketServiceMock.socket = socketTestHelper as unknown as Socket;
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['get', 'post', 'delete', 'handleError']);
    });
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [GamesDisplayComponent],
            providers: [
                { provide: CommunicationService, useValue: communicationServiceSpy },
                HttpClient,
                { provide: SocketClientService, useValue: socketServiceMock },
            ],
        }).compileComponents();
    }));
    beforeEach(() => {
        fixture = TestBed.createComponent(GamesDisplayComponent);
        component = fixture.componentInstance;
        socketClientService = TestBed.inject(SocketClientService);
        component.games = [
            {
                gameData: { id: 1 } as GameData,
                originalImage: Buffer.from([]),
                matchToJoinIfAvailable: null,
            },
            {
                gameData: { id: 2 } as GameData,
                originalImage: Buffer.from([]),
                matchToJoinIfAvailable: null,
            },
        ];
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
        expect(component.gamesNbr).toEqual(4);
        expect(component.showNextButton).toBeFalse();
    });

    it('should change game pages (next/previous games)', async () => {
        spyOn(component, 'fetchGameDataFromServer');
        await component.changeGamePages(true);
        expect(component.currentPageNbr).toBe(1);
        await component.changeGamePages(false);
        expect(component.currentPageNbr).toBe(0);
    });

    it('should delete all games', async () => {
        communicationServiceSpy.delete.and.returnValue(
            of({
                headers: new HttpHeaders(),
                status: 200,
                statusText: 'OK',
                url: '',
                body: 'test',
                type: 4,
                ok: true,
                clone: (): HttpResponse<string> => new HttpResponse<string>(undefined),
            }),
        );
        spyOn(socketClientService.socket, 'emit');
        spyOn(component, 'reloadPage').and.stub();
        await component.deleteAllGames(true);
        expect(communicationServiceSpy.delete).toHaveBeenCalledWith('/games/deleteAllGames');
        expect(socketClientService.socket.emit).toHaveBeenCalledWith('deleteAllGames', { gameToDelete: true });
        expect(component.reloadPage).toHaveBeenCalled();
    });

    it('should add server socket messages listeners', () => {
        spyOn(socketClientService, 'on').and.callThrough();
        component.addServerSocketMessagesListeners();
        const callback = ((params: any) => {}) as any;
        spyOn(component, 'reloadPage').and.stub();
        spyOn(component, 'updateGameAvailability').and.stub();
        socketTestHelper.on('gameProgressUpdate', callback);
        socketTestHelper.peerSideEmit('actionOnGameReloadingThePage');
        const data = { gameId: 1, matchToJoinIfAvailable: 'match' };
        socketTestHelper.peerSideEmit('gameProgressUpdate', data);
        expect(socketClientService.on).toHaveBeenCalledTimes(2);
        expect(socketClientService.on).toHaveBeenCalledWith('gameProgressUpdate', jasmine.any(Function));
        expect(socketClientService.on).toHaveBeenCalledWith('actionOnGameReloadingThePage', jasmine.any(Function));
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

    it('should update game availability', () => {
        const gameId = 1;
        const matchToJoinIfAvailable = 'sample-match-id';

        component.updateGameAvailability(gameId, matchToJoinIfAvailable);

        const updatedGame = component.games.find((game) => game.gameData.id === gameId);
        expect(updatedGame).toBeTruthy();
        expect(updatedGame?.matchToJoinIfAvailable).toBe(matchToJoinIfAvailable);
    });
});
