/* eslint-disable max-lines */
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DelayedMethod } from '@app/classes/delayed-method/delayed-method';
import { ChatComponent } from '@app/components/chat/chat.component';
import { HintComponent } from '@app/components/hint/hint.component';
import { PopUpComponent } from '@app/components/pop-up/pop-up.component';
import { TimerComponent } from '@app/components/timer/timer.component';
import { ChatService } from '@app/services/chat-service/chat.service';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { CanvasHandlingService } from '@app/services/gameplay-service/canvas-handling.service';
import { HintService } from '@app/services/hint-service/hint.service';
import { HistoryService } from '@app/services/history-service/history.service';
import { ImageManipulationService } from '@app/services/image-manipulation-service/image-manipulation.service';
import { MatchmakingService } from '@app/services/matchmaking-service/matchmaking.service';
import { ReplayModeService } from '@app/services/replay-mode-service/replay-mode.service';
import { SocketClientService } from '@app/services/socket-client-service/socket-client.service';
import { TimerService } from '@app/services/timer-service/timer.service';
import { Match } from '@common/classes/match';
import { Vector2 } from '@common/classes/vector2';
import { MatchStatus } from '@common/enums/match-status';
import { GameData } from '@common/interfaces/game-data';
import { RankingData } from '@common/interfaces/ranking.data';
import { ABORTED_GAME_MESSAGE, CANVAS_HEIGHT, LIMITED_TIME_DURATION, MILLISECOND_TO_SECONDS, VOLUME_ERROR, VOLUME_SUCCESS } from '@common/utils/env';
import { Buffer } from 'buffer';
import { catchError, map, Observable, of } from 'rxjs';

@Component({
    selector: 'app-classic-page',
    templateUrl: './classic-page.component.html',
    styleUrls: ['./classic-page.component.scss'],
})
export class ClassicPageComponent implements AfterViewInit, OnInit, OnDestroy {
    @ViewChild('originalImage', { static: true }) leftCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('modifiedImage', { static: true }) rightCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('chat') chat: ChatComponent;
    @ViewChild('timerElement') timerElement: TimerComponent;
    @ViewChild('hintElement') hintElement: HintComponent;
    @ViewChild('popUpElement') popUpElement: PopUpComponent;
    @ViewChild('errorMessage') errorMessage: ElementRef;
    @ViewChild('penalty') penaltyMessage: ElementRef;
    @ViewChild('successSound', { static: true }) successSound: ElementRef<HTMLAudioElement>;
    @ViewChild('errorSound', { static: true }) errorSound: ElementRef<HTMLAudioElement>;
    @ViewChild('cheatElement') cheat: ElementRef | undefined;
    isWinByDefault: boolean = true;
    foundDifferences: boolean[];
    letterTPressed: boolean = true;
    currentGameId: string | null;
    gameTitle: string = '';
    player1: string = '';
    player2: string = '';
    totalDifferences: number = 0;
    differencesFound1: number = 0;
    differencesFound2: number = 0;
    minDifferences: number = 0;
    canvasIsClickable: boolean = false;
    startingTime: Date;
    activePlayer: boolean;
    historyData: { startingTime: Date; gameMode: string; duration: string; player1: string; player2: string; isWinByDefault: boolean };
    hasAlreadyReceiveMatchData: boolean = false;
    newRanking: { name: string; score: number };

    games: { gameData: GameData; originalImage: Buffer; modifiedImage: Buffer }[] = [];
    currentGameIndex: number = 0;
    canvasHandlingService: CanvasHandlingService;
    // eslint-disable-next-line max-params
    constructor(
        public socketService: SocketClientService,
        public communicationService: CommunicationService,
        public replayModeService: ReplayModeService,
        private route: ActivatedRoute,
        private matchmakingService: MatchmakingService,
        private chatService: ChatService,
        private hintService: HintService,
        private historyService: HistoryService,
        private timerService: TimerService,
    ) {}

    // this.historyService.addGameHistory(this.createHistoryData());

    get leftCanvasContext() {
        return this.leftCanvas.nativeElement.getContext('2d');
    }

    get rightCanvasContext() {
        return this.rightCanvas.nativeElement.getContext('2d');
    }

    get isSolo() {
        return this.matchmakingService.isSoloMode;
    }
    get isOneVersusOne() {
        return this.matchmakingService.isOneVersusOne;
    }
    get isLimitedTimeSolo() {
        return this.matchmakingService.isLimitedTimeSolo;
    }
    get currentMatchType() {
        return this.matchmakingService.currentMatchPlayed?.matchType;
    }

    get isPlayer1() {
        return this.matchmakingService.isPlayer1;
    }
    get isCoop() {
        return this.matchmakingService.isCoopMode;
    }
    get isCheating() {
        return this.canvasHandlingService.isCheating;
    }

    getPlayerUsername(isPlayer1: boolean): string {
        if (isPlayer1) return this.matchmakingService.player1Username;
        return this.matchmakingService.player2Username;
    }

    isPlayer1Win(match: Match): boolean {
        return match.matchStatus === MatchStatus.Player1Win;
    }

    isPlayer2Win(match: Match): boolean {
        return match.matchStatus === MatchStatus.Player2Win;
    }

    ngOnInit(): void {
        this.currentGameId = this.route.snapshot.paramMap.get('id');
        this.addServerSocketMessagesListeners();
        this.matchmakingService.onMatchUpdated.add(this.handleMatchUpdate.bind(this));
        this.canvasHandlingService = new CanvasHandlingService(this.leftCanvas, this.rightCanvas, new ImageManipulationService());
        // Replay Mode Initialization
        this.replayModeService.onStartReplayMode.add(this.resetGame.bind(this));
        this.replayModeService.onFinishReplayMode.add(this.finishReplay.bind(this));
        DelayedMethod.speed = 1;

        console.log(this.currentGameId);
        console.log(this.matchmakingService.currentMatchId);
        window.addEventListener('keydown', this.handleEvents.bind(this));
    }

    sendSystemMessageToChat(message: string) {
        this.chat.sendSystemMessage(message);
    }

    ngOnDestroy(): void {
        this.replayModeService.stopAllPlayingActions();
        if (this.differencesFound1 < this.totalDifferences && this.matchmakingService.isSoloMode)
            this.historyService.addGameHistory(this.createHistoryData(this.player1, this.isWinByDefault));
        else if (this.matchmakingService.isSoloMode) this.historyService.addGameHistory(this.createHistoryData(this.player1, !this.isWinByDefault));
        this.socketService.disconnect();
    }

    async playSound(isSuccessSound: boolean) {
        const audioSource = isSuccessSound ? this.successSound : this.errorSound;
        audioSource.nativeElement.currentTime = 0;
        audioSource.nativeElement.volume = isSuccessSound ? VOLUME_SUCCESS : VOLUME_ERROR;
        audioSource.nativeElement.play();
    }

    handleMatchUpdate(match: Match | null) {
        if (this.player1 === '') {
            this.player1 = this.matchmakingService.player1Username;
        }
        if (this.player2 === '') {
            this.player2 = this.matchmakingService.player2Username;
        }
        if (match) {
            this.onReceiveMatchData();
            if (this.isSolo || this.isOneVersusOne) {
                if (this.isPlayer2Win(match)) {
                    this.chat.sendSystemMessage(this.player1.toUpperCase() + ABORTED_GAME_MESSAGE);
                    this.onWinGame(this.player2.toUpperCase(), this.isWinByDefault);
                } else if (this.isPlayer1Win(match)) {
                    this.chat.sendSystemMessage(this.player2.toUpperCase() + ABORTED_GAME_MESSAGE);
                    this.onWinGame(this.player1.toUpperCase(), this.isWinByDefault);
                }
            } else {
                if ((this.isPlayer2Win(match) || this.isPlayer1Win(match)) && this.isCoop) {
                    this.chat.sendSystemMessage(this.player1.toUpperCase() + ABORTED_GAME_MESSAGE);
                    this.onWinGameLimited(this.player1.toUpperCase(), this.player2.toUpperCase(), this.isWinByDefault);
                } else if (this.isPlayer1Win(match)) {
                    this.chat.sendSystemMessage(this.player2.toUpperCase() + ABORTED_GAME_MESSAGE);
                    this.onWinGameLimited(this.player1.toUpperCase(), this.player2.toUpperCase(), this.isWinByDefault);
                }
            }
        }
    }

    onReceiveMatchData() {
        if (this.hasAlreadyReceiveMatchData) return;
        this.hasAlreadyReceiveMatchData = true;
        if (this.isPlayer1) {
            this.activePlayer = true;
        } else {
            this.activePlayer = false;
        }
    }

    ngAfterViewInit(): void {
        const leftCanvasContext = this.leftCanvasContext;
        const rightCanvasContext = this.rightCanvasContext;

        if (leftCanvasContext && rightCanvasContext) {
            this.getInitialImagesFromServer();
        }
        this.canvasHandlingService.focusKeyEvent(this.cheat);
        this.replayModeService.visibleTimer = this.timerElement;
        window.removeEventListener('keydown', this.handleEvents.bind(this));
    }

    async getInitialImagesFromServer() {
        if (this.currentGameIndex === 0) {
            this.fetchGames().subscribe(async (games) => {
                if (games) {
                    this.games = games;
                }
                await this.canvasHandlingService.updateCanvas(
                    this.games[this.currentGameIndex].originalImage,
                    this.games[this.currentGameIndex].modifiedImage,
                );
                await this.updateGameInfo();
            });
        } else {
            await this.canvasHandlingService.updateCanvas(
                this.games[this.currentGameIndex].originalImage,
                this.games[this.currentGameIndex].modifiedImage,
            );
            await this.updateGameInfo();
        }
    }

    fetchGames(): Observable<
        | {
              gameData: GameData;
              originalImage: Buffer;
              modifiedImage: Buffer;
          }[]
        | null
    > {
        const gameId: string = this.currentGameId ? this.currentGameId : '0';
        const routeToSend = this.currentGameId !== '-1' ? '/games/fetchGame/' + gameId : '/games/fetchAllGames';

        return this.communicationService.get(routeToSend).pipe(
            map((response) => {
                if (response.body) {
                    const serverResult = JSON.parse(response.body);
                    this.games = serverResult;
                    return this.games;
                } else {
                    return null;
                }
            }),
            catchError((err) => {
                const responseString = `Server Error : ${err.message}`;
                alert(responseString);
                return of(null);
            }),
        );
    }

    updateGameInfo() {
        this.foundDifferences = new Array(this.games[this.currentGameIndex].gameData.nbrDifferences).fill(false);
        if (this.currentGameId !== '-1') {
            this.totalDifferences = this.games[this.currentGameIndex].gameData.nbrDifferences;
            this.minDifferences = Math.ceil(this.totalDifferences / 2);
        }
        this.requestStartGame();
        this.canvasIsClickable = true;
        if (this.currentGameIndex === 0) {
            this.startTimer();
            this.replayModeService.startRecording();
        }
        this.gameTitle = this.games[this.currentGameIndex].gameData.name;
    }

    startTimer() {
        this.timerElement.resetTimer();
        this.timerElement.startTimer();
    }
    onMouseDown(event: MouseEvent) {
        const coordinateClick: Vector2 = { x: event.offsetX, y: Math.abs(event.offsetY - CANVAS_HEIGHT) };
        console.log('attempt at clicking', coordinateClick);
        if (this.canvasIsClickable) {
            this.socketService.send('validateDifference', {
                foundDifferences: this.foundDifferences,
                position: coordinateClick,
                isPlayer1: this.matchmakingService.isSoloMode ? true : this.matchmakingService.isPlayer1,
            });
            console.log('click');
            this.refreshErrorMessagePosition(event.clientX, event.clientY);
            this.canvasHandlingService.focusKeyEvent(this.cheat);
        } else {
            console.log('canvas is not clickable');
        }
    }

    refreshErrorMessagePosition(x: number, y: number) {
        const refreshErrorMessagePositionMethod = () => {
            this.errorMessage.nativeElement.style.left = x + 'px';
            this.errorMessage.nativeElement.style.top = y + 'px';
        };
        refreshErrorMessagePositionMethod();
        this.replayModeService.addMethodToReplay(refreshErrorMessagePositionMethod);
    }

    requestStartGame() {
        this.socketService.send('registerGameData', { gameData: this.games[this.currentGameIndex].gameData });
    }

    addServerSocketMessagesListeners() {
        if (!this.socketService.isSocketAlive) window.alert('Error : socket not connected');

        this.socketService.on(
            'validationReturned',
            (data: { foundDifferences: boolean[]; isValidated: boolean; foundDifferenceIndex: number; isPlayer1: boolean }) => {
                if (data.isValidated) {
                    const message = 'Différence trouvée par ' + this.getPlayerUsername(data.isPlayer1).toUpperCase();
                    this.sendSystemMessageToChat(message);
                    this.increasePlayerScore(data.isPlayer1);
                    this.refreshFoundDifferences(data.foundDifferences);
                    // this.onFindDifference();

                    if (this.matchmakingService.isLimitedTimeSolo || this.matchmakingService.isCoopMode) {
                        if (this.currentGameIndex === this.games.length - 1) {
                            this.onWinGame(this.matchmakingService.player1Username, !this.isWinByDefault);
                        } else {
                            this.currentGameIndex++;
                            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                            this.timerElement.timeInSeconds = Math.min(LIMITED_TIME_DURATION, this.timerElement.timeInSeconds + 20);
                            if (this.isCheating) {
                                this.stopCheating();
                                this.foundDifferences = new Array(this.games[this.currentGameIndex].gameData.nbrDifferences).fill(false);
                                this.startCheating();
                            }
                            this.getInitialImagesFromServer();
                        }
                    } else if (this.matchmakingService.isOneVersusOne) {
                        if (this.differencesFound1 >= this.minDifferences) {
                            this.onWinGame(this.player2, !this.isWinByDefault);
                        } else if (this.differencesFound2 >= this.minDifferences) this.onWinGame(this.player2, !this.isWinByDefault);
                    } else if (this.isSolo) {
                        if (this.differencesFound1 >= this.totalDifferences) {
                            this.onWinGame(this.player1, !this.isWinByDefault);
                        }
                    }
                } else {
                    this.onFindWrongDifference(data.isPlayer1);
                }
            },
        );
        this.socketService.on('messageBetweenPlayers', (data: { username: string; message: string; sentByPlayer1: boolean }) => {
            this.chatService.pushMessage(
                {
                    text: data.message,
                    username: data.username,
                    sentBySystem: false,
                    sentByPlayer1: data.sentByPlayer1,
                    sentUpdatedScore: false,
                    sentTime: Date.now(),
                },
                this.chat,
            );
        });

        this.socketService.on('newBreakingScore', (data: { rankingData: RankingData }) => {
            this.chat.sendTimeScoreMessage(data.rankingData);
        });
    }

    increasePlayerScore(isPlayer1: boolean) {
        const increaseScoreMethod = () => {
            if (isPlayer1) this.differencesFound1++;
            else this.differencesFound2++;
        };
        increaseScoreMethod();
        this.replayModeService.addMethodToReplay(increaseScoreMethod);
    }

    refreshFoundDifferences(foundDifferences: boolean[]) {
        const refreshMethod = () => {
            this.foundDifferences = foundDifferences;
            this.onFindDifference();
        };
        console.log('refresh found differences');
        refreshMethod();
        this.replayModeService.addMethodToReplay(refreshMethod);
    }

    onFindWrongDifference(isPlayer1: boolean) {
        let message = 'Erreur';

        if (!this.matchmakingService.isSoloMode) {
            message += ' par ' + this.getPlayerUsername(isPlayer1).toUpperCase();
        }
        if (isPlayer1 === this.matchmakingService.isPlayer1) this.showErrorText();
        this.canvasHandlingService.focusKeyEvent(this.cheat);
        this.sendSystemMessageToChat(message);
    }

    showErrorText() {
        const showErrorMethod = () => {
            this.errorMessage.nativeElement.style.display = 'block';
            this.leftCanvas.nativeElement.style.pointerEvents = 'none';
            this.rightCanvas.nativeElement.style.pointerEvents = 'none';
            this.playSound(false);

            const delayedHideError = new DelayedMethod(() => {
                this.errorMessage.nativeElement.style.display = 'none';
                this.leftCanvas.nativeElement.style.pointerEvents = 'auto';
                this.rightCanvas.nativeElement.style.pointerEvents = 'auto';
            }, MILLISECOND_TO_SECONDS);
            delayedHideError.start();
        };
        showErrorMethod();
        this.replayModeService.addMethodToReplay(showErrorMethod);
    }

    onFindDifference() {
        this.playSound(true);
        if (this.currentGameId !== '-1') {
            this.canvasHandlingService.refreshModifiedImage(this.games[this.currentGameIndex].gameData, this.foundDifferences);
        }
        if (this.isCheating) {
            this.stopCheating();
            this.startCheating();
        }
        this.canvasHandlingService.focusKeyEvent(this.cheat);
    }

    gameOver(isWinByDefault: boolean) {
        this.timerElement.pauseTimer();
        this.socketService.disconnect();
        this.replayModeService.stopRecording();
        if (!isWinByDefault) {
            // this.sendNewTimeScoreToServer();
        } else {
            this.socketService.disconnect();
        }
    }

    sendNewTimeScoreToServer() {
        this.socketService.send('gameOver', {
            gameId: this.games[this.currentGameIndex].gameData.id.toString(),
            isOneVersusOne: this.isOneVersusOne,
            ranking: {
                name: this.newRanking.name,
                score: this.newRanking.score,
            },
        });
    }

    onQuitGame() {
        this.popUpElement.showConfirmationPopUp();
    }

    onWinGame(winningPlayer: string, isWinByDefault: boolean) {
        if (this.getPlayerUsername(this.matchmakingService.isPlayer1) === winningPlayer && this.matchmakingService.isOneVersusOne) {
            this.historyService.addGameHistory(this.createHistoryData(winningPlayer, isWinByDefault));
        } else if (this.matchmakingService.isPlayer1 && isWinByDefault) {
            this.historyService.addGameHistory(this.createHistoryData(winningPlayer, isWinByDefault));
        }
        this.newRanking = { name: winningPlayer, score: this.timerService.winningTimeInSeconds };

        this.gameOver(isWinByDefault);
        const startReplayAction = this.replayModeService.startReplayModeAction;
        this.popUpElement.showGameOverPopUp(winningPlayer, isWinByDefault, this.matchmakingService.isSoloMode, startReplayAction);
    }

    createHistoryData(winningPlayer: string, isWinByDefault: boolean) {
        const gameMode = this.matchmakingService.isSoloMode ? 'Classic - Solo' : 'Classic - 1vs1';
        const time = this.timerElement.getTime();

        const player1Username = this.matchmakingService.isSoloMode ? this.player1 : winningPlayer;
        const player2Username = this.matchmakingService.isSoloMode ? '' : this.player2 === winningPlayer ? this.player1 : this.player2;
        this.historyData = {
            startingTime: this.startingTime,
            duration: time,
            gameMode,
            player1: player1Username,
            player2: player2Username,
            isWinByDefault,
        };

        return this.historyData;
    }

    handleEvents(event: KeyboardEvent) {
        if (
            this.matchmakingService.isSoloMode ||
            this.matchmakingService.isLimitedTimeSolo ||
            this.matchmakingService.isOneVersusOne ||
            this.isCoop ||
            (this.chat && this.chat.input && document.activeElement !== this.chat.input.nativeElement)
        ) {
            if (this.replayModeService.shouldShowReplayModeGUI) return;
            if (event.key === 't') {
                if (this.letterTPressed) {
                    this.startCheating();
                } else {
                    this.stopCheating();
                }
                this.letterTPressed = !this.letterTPressed;
            }
            if (event.key === 'i') {
                this.handleHintMode();
            }
        }
    }
    onWinGameLimited(winningPlayer1: string, winningPlayer2: string, isWinByDefault: boolean) {
        this.gameOver(isWinByDefault);
        this.popUpElement.showGameOverPopUpLimited(winningPlayer1, winningPlayer2, isWinByDefault, this.matchmakingService.isLimitedTimeSolo);
    }

    handleHintMode() {
        if (this.hintService.maxGivenHints !== 0) {
            this.hintService.showHint(
                this.rightCanvas,
                this.rightCanvasContext as CanvasRenderingContext2D,
                this.canvasHandlingService.currentModifiedImage,
                this.games[this.currentGameIndex].modifiedImage,
                { gameData: this.games[this.currentGameIndex].gameData, hints: this.hintService.maxGivenHints, diffs: this.foundDifferences },
            );
            this.hintService.decrement();
            this.timerElement.timeInSeconds = this.hintService.handleHint(this.chat, this.timerElement.timeInSeconds);
            this.timerElement.refreshTimerDisplay();
            this.hintService.showMessage(this.penaltyMessage);
        }
    }

    startCheating() {
        const startCheatingMethod = () => {
            this.canvasHandlingService.initializeCheatMode(
                this.games[this.currentGameIndex].gameData,
                {
                    originalImage: this.games[this.currentGameIndex].originalImage,
                    modifiedImage: this.games[this.currentGameIndex].modifiedImage,
                },
                this.foundDifferences,
            );
        };
        startCheatingMethod();
        this.replayModeService.addMethodToReplay(startCheatingMethod);
    }

    stopCheating() {
        const stopCheatingMethod = () => {
            this.canvasHandlingService.stopCheating();
        };
        stopCheatingMethod();
        this.replayModeService.addMethodToReplay(stopCheatingMethod);
    }

    resetGame() {
        this.foundDifferences = [];
        this.canvasHandlingService.stopCheating();
        this.canvasHandlingService.currentModifiedImage = Buffer.from(this.games[this.currentGameIndex].modifiedImage);
        this.canvasHandlingService.updateCanvas(this.games[this.currentGameIndex].originalImage, this.games[this.currentGameIndex].modifiedImage);
        this.stopCheating();
        this.canvasHandlingService.isCheating = false;
        this.chat.resetChat();
        this.differencesFound1 = 0;
        this.differencesFound2 = 0;
    }

    finishReplay() {
        this.timerElement.pauseTimer();
    }
}
