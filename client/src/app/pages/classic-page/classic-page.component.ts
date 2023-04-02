/* eslint-disable max-lines */
import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DelayedMethod } from '@app/classes/delayed-method/delayed-method';
import { ChatComponent } from '@app/components/chat/chat.component';
import { HintComponent } from '@app/components/hint/hint.component';
import { PopUpComponent } from '@app/components/pop-up/pop-up.component';
import { TimerComponent } from '@app/components/timer/timer.component';
import { ChatService } from '@app/services/chat-service/chat.service';
import { CheatModeService } from '@app/services/cheat-mode-service/cheat-mode.service';
import { CommunicationService } from '@app/services/communication-service/communication.service';
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
import { CANVAS_HEIGHT, MILLISECOND_TO_SECONDS, VOLUME_ERROR, VOLUME_SUCCESS } from '@common/utils/env';
import { Buffer } from 'buffer';

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
    isCheating: boolean = false;
    backgroundColor = '';
    intervalIDLeft: number | undefined;
    intervalIDRight: number | undefined;
    matchId: string;
    currentGameId: string | null;
    game: { gameData: GameData; originalImage: Buffer; modifiedImage: Buffer };
    originalImage: File | null;
    modifiedImage: File | null;
    gameTitle: string = '';
    player1: string = '';
    player2: string = '';
    currentModifiedImage: Buffer;
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

    // eslint-disable-next-line max-params
    constructor(
        public socketService: SocketClientService,
        public communicationService: CommunicationService,
        public replayModeService: ReplayModeService,
        private route: ActivatedRoute,
        private imageManipulationService: ImageManipulationService,
        private matchmakingService: MatchmakingService,
        private cheatModeService: CheatModeService,
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

    get isOneVersusOne() {
        return this.matchmakingService.isOneVersusOne;
    }

    get currentMatchType() {
        return this.matchmakingService.currentMatchPlayed?.matchType;
    }

    get isPlayer1() {
        return this.matchmakingService.isPlayer1;
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
        window.addEventListener('keydown', this.handleEvents.bind(this));

        // Replay Mode Initialization
        this.replayModeService.onStartReplayMode.add(this.resetGame.bind(this));
        this.replayModeService.onFinishReplayMode.add(this.finishReplay.bind(this));
        DelayedMethod.speed = 1;
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
            this.matchId = this.matchmakingService.currentMatchId as string;
            this.onReceiveMatchData();
            const abortedGameMessage = ' a abandonné la partie';

            if (this.isPlayer2Win(match)) {
                this.sendSystemMessageToChat(this.player1.toUpperCase() + abortedGameMessage);
                this.onWinGame(this.player2.toUpperCase(), this.isWinByDefault);
            } else if (this.isPlayer1Win(match)) {
                this.sendSystemMessageToChat(this.player2.toUpperCase() + abortedGameMessage);
                this.onWinGame(this.player1.toUpperCase(), this.isWinByDefault);
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
        this.cheatModeService.focusKeyEvent(this.cheat);
        window.removeEventListener('keydown', this.handleEvents.bind(this));
        this.replayModeService.visibleTimer = this.timerElement;
    }

    getInitialImagesFromServer() {
        const gameId: string = this.currentGameId ? this.currentGameId : '0';
        const routeToSend = '/games/fetchGame/' + gameId;

        this.communicationService.get(routeToSend).subscribe({
            next: (response) => {
                if (response.body) {
                    const serverResult = JSON.parse(response.body);
                    this.game = serverResult;
                    const img1Source = this.imageManipulationService.getImageSourceFromBuffer(this.game.originalImage);
                    const img2Source = this.imageManipulationService.getImageSourceFromBuffer(this.game.modifiedImage);
                    this.loadImagesToCanvas(img1Source, img2Source);
                    this.requestStartGame();
                    this.canvasIsClickable = true;
                    this.startingTime = new Date();

                    // this.timerService.start();
                    // this.timerService.handleTickingTime(this.timerElement.minute, this.timerElement.second);
                    this.startTimer();
                    this.replayModeService.startRecording();
                    this.gameTitle = this.game.gameData.name;
                }
            },
            error: (err: HttpErrorResponse) => {
                const responseString = `Server Error : ${err.message}`;
                alert(responseString);
            },
        });
    }

    loadImagesToCanvas(imgSource1: string, imgSource2: string) {
        const leftCanvasContext = this.leftCanvasContext;
        const rightCanvasContext = this.rightCanvasContext;
        if (leftCanvasContext && rightCanvasContext) {
            this.imageManipulationService.loadCanvasImages(imgSource1, leftCanvasContext);
            this.imageManipulationService.loadCanvasImages(imgSource2, rightCanvasContext);
        }
        this.foundDifferences = new Array(this.game.gameData.nbrDifferences).fill(false);
        this.totalDifferences = this.game.gameData.nbrDifferences;
        this.minDifferences = Math.ceil(this.totalDifferences / 2);
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
            this.cheatModeService.focusKeyEvent(this.cheat);
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
        this.socketService.send('registerGameData', { gameData: this.game.gameData });
    }

    addServerSocketMessagesListeners() {
        if (!this.socketService.isSocketAlive) window.alert('Error : socket not connected');

        this.socketService.on(
            'validationReturned',
            (data: { foundDifferences: boolean[]; isValidated: boolean; foundDifferenceIndex: number; isPlayer1: boolean }) => {
                if (data.isValidated) {
                    let message = 'Différence trouvée';

                    if (data.isPlayer1) {
                        // this.differencesFound1++;
                        if (this.isOneVersusOne) {
                            message += ' par ' + this.player1.toUpperCase();
                        }
                    } else {
                        message += ' par ' + this.player2.toUpperCase();
                        // this.differencesFound2++;
                    }
                    this.increasePlayerScore(data.isPlayer1);
                    this.sendSystemMessageToChat(message);
                    // this.foundDifferences = data.foundDifferences;
                    // this.onFindDifference();
                    this.refreshFoundDifferences(data.foundDifferences);

                    if (this.isOneVersusOne) {
                        if (this.differencesFound1 >= this.minDifferences) {
                            this.onWinGame(this.player2, !this.isWinByDefault);
                        } else if (this.differencesFound2 >= this.minDifferences) this.onWinGame(this.player2, !this.isWinByDefault);
                    } else if (!this.isOneVersusOne) {
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
            if (isPlayer1) {
                message += ' par ' + this.matchmakingService.player1Username.toUpperCase();
            } else {
                message += ' par ' + this.matchmakingService.player2Username.toUpperCase();
            }
        }
        if (isPlayer1 === this.matchmakingService.isPlayer1) this.showErrorText();
        this.cheatModeService.focusKeyEvent(this.cheat);
        this.sendSystemMessageToChat(message);
    }

    showErrorText() {
        const showErrorMethod = () => {
            this.errorMessage.nativeElement.style.display = 'block';
            this.leftCanvas.nativeElement.style.pointerEvents = 'none';
            this.rightCanvas.nativeElement.style.pointerEvents = 'none';
            this.playSound(false);

            // setTimeout(() => {
            //     this.errorMessage.nativeElement.style.display = 'none';
            //     this.leftCanvas.nativeElement.style.pointerEvents = 'auto';
            //     this.rightCanvas.nativeElement.style.pointerEvents = 'auto';
            // }, MILLISECOND_TO_SECONDS);
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
        this.refreshModifiedImage();
        if (this.isCheating) {
            this.stopCheating();
            this.startCheating();
        }
        this.cheatModeService.focusKeyEvent(this.cheat);
    }

    async refreshModifiedImage() {
        const newImage = this.imageManipulationService.getModifiedImageWithoutDifferences(
            this.game.gameData,
            { originalImage: this.game.originalImage, modifiedImage: this.game.modifiedImage },
            this.foundDifferences,
        );

        if (this.rightCanvasContext) {
            await this.imageManipulationService.blinkDifference(
                this.currentModifiedImage ? this.currentModifiedImage : this.game.modifiedImage,
                newImage,
                this.rightCanvasContext,
            );
            this.currentModifiedImage = newImage;
        }
    }

    gameOver(isWinByDefault: boolean) {
        this.timerElement.pauseTimer();
        this.replayModeService.stopRecording();
        if (!isWinByDefault) {
            // this.sendNewTimeScoreToServer();
        } else {
            this.socketService.disconnect();
        }
    }

    sendNewTimeScoreToServer() {
        this.socketService.send('gameOver', {
            gameId: this.game.gameData.id.toString(),
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
        if (this.matchmakingService.isSoloMode || (this.chat && this.chat.input && document.activeElement !== this.chat.input.nativeElement)) {
            if (this.replayModeService.shouldShowReplayModeGUI) return;
            if (event.key === 't') {
                if (this.letterTPressed) {
                    this.startCheating();
                } else {
                    this.stopCheating();
                    // this.putCanvasIntoInitialState();
                }
                this.letterTPressed = !this.letterTPressed;
            }
            // if (event.key === 'i'){
            //     this.handleHintMode();
            // }
        }
    }

    handleHintMode() {
        if (this.hintService.maxGivenHints !== 0) {
            this.hintService.showHint(
                this.rightCanvas,
                this.rightCanvasContext as CanvasRenderingContext2D,
                this.currentModifiedImage,
                this.game.modifiedImage,
                { gameData: this.game.gameData, hints: this.hintService.maxGivenHints, diffs: this.foundDifferences },
            );
            this.hintService.decrement();
            this.timerElement.timeInSeconds = this.hintService.handleHint(this.chat, this.timerElement.timeInSeconds);
            this.timerElement.refreshTimerDisplay();
            this.hintService.showMessage(this.penaltyMessage);
        }
    }

    startCheating() {
        const startCheatingMethod = () => {
            this.backgroundColor = '#66FF99';
            const newImage = this.imageManipulationService.getModifiedImageWithoutDifferences(
                this.game.gameData,
                { originalImage: this.game.originalImage, modifiedImage: this.game.modifiedImage },
                this.foundDifferences,
            );
            this.showHiddenDifferences(newImage);
            this.isCheating = !this.isCheating;
        };
        startCheatingMethod();
        this.replayModeService.addMethodToReplay(startCheatingMethod);
    }

    stopCheating() {
        const stopCheatingMethod = () => {
            this.backgroundColor = '';
            this.cheatModeService.stopCheating(this.intervalIDLeft as number, this.intervalIDRight as number);
            this.isCheating = !this.isCheating;

            this.putCanvasIntoInitialState();
        };
        stopCheatingMethod();
        this.replayModeService.addMethodToReplay(stopCheatingMethod);
    }

    showHiddenDifferences(newImage: Buffer) {
        if (this.leftCanvasContext && this.rightCanvasContext) {
            this.intervalIDLeft = this.cheatModeService.startInterval(
                { originalImage: this.game.originalImage, newImage },
                this.leftCanvasContext as CanvasRenderingContext2D,
            );

            this.intervalIDRight = this.cheatModeService.startInterval(
                { originalImage: this.game.originalImage, newImage },
                this.rightCanvasContext as CanvasRenderingContext2D,
            );
            this.currentModifiedImage = newImage;
        }
    }

    putCanvasIntoInitialState() {
        this.cheatModeService.putCanvasIntoInitialState(
            { originalImage: this.game.originalImage, currentModifiedImage: this.currentModifiedImage },
            { leftContext: this.leftCanvasContext as CanvasRenderingContext2D, rightContext: this.rightCanvasContext as CanvasRenderingContext2D },
        );
    }

    resetGame() {
        this.foundDifferences = [];
        this.currentModifiedImage = Buffer.from(this.game.modifiedImage);
        const img1Source = this.imageManipulationService.getImageSourceFromBuffer(this.game.originalImage);
        const img2Source = this.imageManipulationService.getImageSourceFromBuffer(this.game.modifiedImage);
        this.loadImagesToCanvas(img1Source, img2Source);
        this.stopCheating();
        this.isCheating = false;
        this.chat.resetChat();
        this.differencesFound1 = 0;
        this.differencesFound2 = 0;
    }

    finishReplay() {
        this.timerElement.pauseTimer();
    }
}
