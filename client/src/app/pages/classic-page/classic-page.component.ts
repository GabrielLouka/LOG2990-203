/* eslint-disable no-console */
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
import { ImageManipulationService } from '@app/services/image-manipulation-service/image-manipulation.service';
import { MatchmakingService } from '@app/services/matchmaking-service/matchmaking.service';
import { ReplayModeService } from '@app/services/replay-mode-service/replay-mode.service';
import { SocketClientService } from '@app/services/socket-client-service/socket-client.service';
import { Match } from '@common/classes/match';
import { Vector2 } from '@common/classes/vector2';
import { MatchStatus } from '@common/enums/match-status';
import { MatchType } from '@common/enums/match-type';
import { GameData } from '@common/interfaces/game-data';
import { RankingData } from '@common/interfaces/ranking.data';
import { ABORTED_GAME_MESSAGE, CANVAS_HEIGHT, LIMITED_TIME_DURATION, MILLISECOND_TO_SECONDS, VOLUME_ERROR, VOLUME_SUCCESS } from '@common/utils/env';
import { Buffer } from 'buffer';
import { Observable, catchError, map, of } from 'rxjs';

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
    startingTime: Date;
    activePlayer: boolean;
    hasAlreadyReceiveMatchData: boolean = false;
    newRanking: { name: string; score: number };
    games: { gameData: GameData; originalImage: Buffer; modifiedImage: Buffer }[] = [];
    currentGameIndex: number = 0;
    canvasHandlingService: CanvasHandlingService;

    replaySpeedOptions: number[] = [1, 2, 4];
    currentReplaySpeedIndex = 0;
    seedsArray: number[];
    isOver: boolean = false;
    isPlayer1Ready: boolean = false;
    isPlayer2Ready: boolean = false;
    // eslint-disable-next-line max-params
    constructor(
        public socketService: SocketClientService,
        public communicationService: CommunicationService,
        public replayModeService: ReplayModeService,
        private route: ActivatedRoute,
        public matchmakingService: MatchmakingService,
        private chatService: ChatService,
        private hintService: HintService,
    ) {}

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

    get currentReplaySpeed(): number {
        return this.replaySpeedOptions[this.currentReplaySpeedIndex];
    }

    get numberOfDifferencesRequiredToWin(): number {
        return this.isOneVersusOne ? this.minDifferences : this.totalDifferences;
    }

    get isGameInteractable(): boolean {
        return !this.replayModeService.shouldShowReplayModeGUI;
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
    gameIsOver(match: Match): boolean {
        return match.matchStatus === MatchStatus.Player1Win || match.matchStatus === MatchStatus.Player2Win;
    }

    ngOnInit(): void {
        this.currentGameId = this.route.snapshot.paramMap.get('id');
        this.addServerSocketMessagesListeners();
        this.matchmakingService.onMatchUpdated.add(this.handleMatchUpdate.bind(this));
        this.canvasHandlingService = new CanvasHandlingService(this.leftCanvas, this.rightCanvas, new ImageManipulationService());
        if (this.currentGameId === '-1') {
            this.socketService.send('randomizeGameOrder');
        }
        // Replay Mode Initialization
        this.replayModeService.onStartReplayMode.add(this.resetGame.bind(this));
        this.replayModeService.onFinishReplayMode.add(this.finishReplay.bind(this));
        DelayedMethod.speed = 1;

        window.addEventListener('keydown', this.handleEvents.bind(this));
        window.addEventListener('keydown', this.handleKeyUpEvent.bind(this));
        // document.addEventListener('keydown', (event: KeyboardEvent) => { //will cause crash if first using button, then 'i'
        //     if (event.key === 'i' && (this.matchmakingService.isSoloMode || this.matchmakingService.isLimitedTimeSolo)) {
        //         this.handleHintMode();
        //     }
        // });

        this.hintService.reset();
        this.hintService.initialize();
    }

    sendSystemMessageToChat(message: string) {
        this.chat.sendSystemMessage(message);
    }

    ngOnDestroy(): void {
        this.replayModeService.stopAllPlayingActions();
        if (this.differencesFound1 < this.totalDifferences && this.matchmakingService.isSoloMode) {
            // this.historyService.createHistoryData(
            //     this.player1,
            //     this.differencesFound1 < this.totalDifferences,
            //     this.matchmakingService.currentMatch?.matchType as MatchType,
            //     this.player1,
            //     this.player2,
            //     this.timerElement.getTime(),
            // );
        }
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
            if (this.gameIsOver(match) && !this.isOver) {
                if (this.isSolo || this.isOneVersusOne) {
                    this.chat.sendSystemMessage(
                        (this.isPlayer1Win(match) ? this.player2.toUpperCase() : this.player1.toUpperCase()) + ABORTED_GAME_MESSAGE,
                    );
                    this.onWinGame(this.isPlayer1Win(match), true);
                } else {
                    this.matchmakingService.setCurrentMatchType(MatchType.LimitedSolo);
                    this.isOver = true;
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
        // this.canvasIsClickable = false;

        if (this.currentGameIndex === 0) {
            this.fetchGames().subscribe(async (games) => {
                if (games) {
                    this.games = games;
                }
                if (this.currentGameId === '-1') {
                    let k = 0;
                    this.games.sort(() => this.matchmakingService.currentSeeds[k++] - 1 / 2);
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
        if (this.currentGameIndex === 0) {
            this.replayModeService.startRecording();
        }
        this.gameTitle = this.games[this.currentGameIndex].gameData.name;
    }

    startTimer() {
        this.timerElement.resetTimer();
        this.timerElement.startTimer();
        // this.historyService.saveStartGameTime();
    }
    onMouseDown(event: MouseEvent) {
        if (!this.isGameInteractable) return;
        const coordinateClick: Vector2 = { x: event.offsetX, y: Math.abs(event.offsetY - CANVAS_HEIGHT) };
        // console.log('attempt at clicking', coordinateClick, this.canvasIsClickable);

        this.socketService.send('validateDifference', {
            foundDifferences: this.foundDifferences,
            position: coordinateClick,
            isPlayer1: this.matchmakingService.isSoloMode ? true : this.matchmakingService.isPlayer1,
        });

        console.log('click');
        this.refreshErrorMessagePosition(event.clientX, event.clientY);
        this.canvasHandlingService.focusKeyEvent(this.cheat);
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
        this.socketService.send('readyPlayer', { isPlayer1: this.isPlayer1 });
    }

    addServerSocketMessagesListeners() {
        if (!this.socketService.isSocketAlive) window.alert('Error : socket not connected');
        this.socketService.on('readyUpdate', (data: { isPlayer1: boolean }) => {
            if (!this.isPlayer1Ready && data.isPlayer1) {
                this.isPlayer1Ready = true;
            } else if (!this.isPlayer2Ready && !data.isPlayer1) {
                this.isPlayer2Ready = true;
            }
            if ((this.isPlayer1Ready && this.isPlayer2Ready) || this.isSolo || this.isLimitedTimeSolo) {
                this.startTimer();
            }
        });
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
                            this.onWinGame(true, this.isOver);
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
                    } else {
                        const player1Wins = this.differencesFound1 >= this.numberOfDifferencesRequiredToWin;
                        const player2Wins = this.differencesFound2 >= this.numberOfDifferencesRequiredToWin;
                        if (player1Wins || player2Wins) {
                            this.onWinGame(data.isPlayer1, !this.isWinByDefault);
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
        this.socketService.on('randomizedOrder', async (data: { seedsArray: number[] }) => {
            this.matchmakingService.currentSeeds = await data.seedsArray;
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
        this.replayModeService.stopRecording();
        if (!isWinByDefault) {
            this.sendNewTimeScoreToServer();
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
                gameName: this.games[this.currentGameIndex].gameData.name,
            },
        });
    }

    onQuitGame() {
        this.popUpElement.showConfirmationPopUp();
    }

    onWinGame(isPlayer1Win: boolean, isWinByDefault: boolean) {
        const winningPlayer = isPlayer1Win ? this.matchmakingService.player1Username : this.matchmakingService.player2Username;
        if (this.isPlayer1 === isPlayer1Win) {
            // console.log('You Win : ' + winningPlayer);
            // this.historyService.createHistoryData(
            //     winningPlayer,
            //     isWinByDefault,
            //     this.matchmakingService.currentMatch?.matchType as MatchType,
            //     this.player1,
            //     this.player2,
            //     this.timerElement.getTime(),
            // );

            this.socketService.send('setWinner', {
                matchId: this.matchmakingService.currentMatchId,
                winner: isPlayer1Win ? this.matchmakingService.player1 : this.matchmakingService.player2,
            });
        }
        this.newRanking = { name: winningPlayer, score: this.timerElement.timeInSeconds };
        this.gameOver(isWinByDefault);
        const startReplayAction = this.replayModeService.startReplayModeAction;
        this.isOver = true;
        this.popUpElement.showGameOverPopUp(
            isWinByDefault,
            this.currentMatchType as MatchType,
            startReplayAction,
            isPlayer1Win ? this.getPlayerUsername(true) : this.getPlayerUsername(false),
            isPlayer1Win ? this.getPlayerUsername(false) : this.getPlayerUsername(true),
        );
    }

    handleEvents(event: KeyboardEvent | MouseEvent) {
        if (
            this.matchmakingService.isSoloMode ||
            this.matchmakingService.isLimitedTimeSolo ||
            this.matchmakingService.isOneVersusOne ||
            this.isCoop ||
            (this.chat && this.chat.input && document.activeElement !== this.chat.input.nativeElement)
        ) {
            if (!this.isGameInteractable) return;
            if (event instanceof KeyboardEvent) {
                if (event.key === 't') {
                    if (this.letterTPressed) {
                        this.startCheating();
                    } else {
                        this.stopCheating();
                    }
                }
                // else if (event.key === 'i'){
                //     this.handleHintMode();
                // }
            } else if (event instanceof MouseEvent) {
                const element = this.hintElement.div.nativeElement;
                if (element && element.contains(event.target as HTMLElement)) {
                    this.handleHintMode();
                }
            }
        }
    }

    handleKeyUpEvent(event: KeyboardEvent) {
        if (!this.isGameInteractable) return;
        if (event.key === 'i' && (this.matchmakingService.isSoloMode || this.matchmakingService.isLimitedTimeSolo)) {
            this.handleHintMode();
            this.canvasHandlingService.focusKeyEvent(this.hintElement.div);
        }
    }

    onWinGameLimited(winningPlayer1: string, winningPlayer2: string, isWinByDefault: boolean) {
        this.gameOver(isWinByDefault);
        this.popUpElement.showGameOverPopUpLimited(winningPlayer1, winningPlayer2, isWinByDefault, this.matchmakingService.isLimitedTimeSolo);
    }

    handleHintMode() {
        const showHintMethod = () => {
            if (this.hintService.maxGivenHints.getValue() > 0) {
                this.hintService.showHint(
                    this.rightCanvas,
                    this.rightCanvasContext as CanvasRenderingContext2D,
                    this.canvasHandlingService.currentModifiedImage,
                    this.games[this.currentGameIndex].modifiedImage,
                    {
                        gameData: this.games[this.currentGameIndex].gameData,
                        hints: this.hintService.maxGivenHints.getValue(),
                        diffs: this.foundDifferences,
                    },
                );
                this.hintService.decrement();
                this.timerElement.timeInSeconds = this.hintService.handleHint(this.chat, this.timerElement.timeInSeconds, this.isLimitedTimeSolo);
                this.timerElement.refreshTimerDisplay();
                this.hintService.showRedError(this.penaltyMessage);
            }
        };
        showHintMethod();
        this.hintService.sendHintMessage(this.chat);
        this.replayModeService.addMethodToReplay(showHintMethod);
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
            this.letterTPressed = false;
        };
        startCheatingMethod();
        this.replayModeService.addMethodToReplay(startCheatingMethod);
    }

    stopCheating() {
        const stopCheatingMethod = () => {
            this.canvasHandlingService.stopCheating();
            this.letterTPressed = true;
        };
        stopCheatingMethod();
        this.replayModeService.addMethodToReplay(stopCheatingMethod);
    }

    resetGame() {
        this.foundDifferences = [];
        this.stopCheating();
        this.canvasHandlingService.currentModifiedImage = Buffer.from(this.games[this.currentGameIndex].modifiedImage);
        this.canvasHandlingService.updateCanvas(this.games[this.currentGameIndex].originalImage, this.games[this.currentGameIndex].modifiedImage);
        this.chat.resetChat();
        this.differencesFound1 = 0;
        this.differencesFound2 = 0;
        this.hintService.reset();
    }

    onReplaySpeedButtonClick(): void {
        this.currentReplaySpeedIndex = (this.currentReplaySpeedIndex + 1) % this.replaySpeedOptions.length;
        this.replayModeService.replaySpeed = this.currentReplaySpeed;
    }

    finishReplay() {
        this.timerElement.pauseTimer();
        this.stopCheating();
    }
}
