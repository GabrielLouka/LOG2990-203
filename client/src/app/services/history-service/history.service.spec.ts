import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { HistoryService } from './history.service';

describe('HistoryService', () => {
    let service: HistoryService;
    let communicationService: CommunicationService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [CommunicationService],
        });
        service = TestBed.inject(HistoryService);
        communicationService = TestBed.inject(CommunicationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
        expect(communicationService).toBeTruthy();
    });

    it('convertGameModeToString should return the correct string', () => {
        const gameMode = 0;
        expect(service.convertGameModeToString(gameMode)).toEqual('Classique - Solo');
    });

    it('convertGameModeToString should return the correct string', () => {
        const gameMode = 1;
        expect(service.convertGameModeToString(gameMode)).toEqual('Classique - 1vs1');
    });

    it('convertGameModeToString should return the correct string', () => {
        const gameMode = 2;
        expect(service.convertGameModeToString(gameMode)).toEqual('Temps Limité - Solo');
    });

    it('convertGameModeToString should return the correct string', () => {
        const gameMode = 3;
        expect(service.convertGameModeToString(gameMode)).toEqual('Temps Limité - Coop');
    });

    it('convertGameModeToString should return the correct string', () => {
        const gameMode = 4;
        expect(service.convertGameModeToString(gameMode)).toEqual('sus');
    });

    it('should format history data correctly', () => {
        const serverResult = [
            {
                startingTime: '2022-01-01T00:00:00Z',
                duration: '60',
                gameMode: 1,
                player1: 'player1',
                player2: 'player2',
                isWinByDefault: false,
                isGameLoose: true,
            },
            {
                startingTime: '2022-01-02T00:00:00Z',
                duration: '120',
                gameMode: 2,
                player1: 'player1',
                player2: 'player2',
                isWinByDefault: false,
                isGameLoose: false,
            },
            {
                startingTime: '2022-01-02T00:00:00Z',
                duration: '120',
                gameMode: 1,
                player1: 'player1',
                player2: 'player2',
                isWinByDefault: false,
                isGameLoose: false,
                isPlayer1Victory: true,
            },
        ];

        service.formatHistoryData(serverResult);

        expect(service.gameHistories).toEqual([
            {
                startingTime: '31.12.2021 - 19:00',
                duration: '60',
                gameMode: 'Classique - 1vs1',
                player1: 'player2',
                player2: 'player1',
                isWinByDefault: false,
                isGameLoose: true,
            },
            {
                startingTime: '01.01.2022 - 19:00',
                duration: '120',
                gameMode: 'Temps Limité - Solo',
                player1: 'player1',
                player2: 'player1',
                isWinByDefault: false,
                isGameLoose: false,
            },
            {
                startingTime: '01.01.2022 - 19:00',
                duration: '120',
                gameMode: 'Classique - 1vs1',
                player1: 'player1',
                player2: 'player2',
                isWinByDefault: false,
                isGameLoose: false,
            },
        ]);
    });

    it('should delete game history', () => {
        const spyDelete = spyOn(communicationService, 'delete');
        const spyReloadPage = spyOn(service, 'reloadPage');

        service.deleteHistory();

        expect(spyDelete).toHaveBeenCalledWith('/history/');
        expect(spyReloadPage).toHaveBeenCalled();
    });
});
