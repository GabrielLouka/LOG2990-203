/* eslint-disable max-lines */
import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatComponent } from '@app/components/chat/chat.component';
import { HintComponent } from '@app/components/hint/hint.component';
import { PopUpComponent } from '@app/components/pop-up/pop-up.component';
import { TimerComponent } from '@app/components/timer/timer.component';
import { ChatService } from '@app/services/chat-service/chat.service';
import { CheatModeService } from '@app/services/cheat-mode-service/cheat-mode.service';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { HintService } from '@app/services/hint-service/hint.service';
import { ImageManipulationService } from '@app/services/image-manipulation-service/image-manipulation.service';
import { MatchmakingService } from '@app/services/matchmaking-service/matchmaking.service';
import { SocketClientService } from '@app/services/socket-client-service/socket-client.service';
import { Match } from '@common/classes/match';
import { Vector2 } from '@common/classes/vector2';
import { MatchStatus } from '@common/enums/match-status';
import { GameData } from '@common/interfaces/game-data';
import { CANVAS_HEIGHT, MILLISECOND_TO_SECONDS, MINUTE_TO_SECONDS, VOLUME_ERROR, VOLUME_SUCCESS } from '@common/utils/env';
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
    numberOfHints: number;
    timeInSeconds: number;
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

    // eslint-disable-next-line max-params
    constructor(
        public socketService: SocketClientService,
        public communicationService: CommunicationService,
        private route: ActivatedRoute,
        private imageManipulationService: ImageManipulationService,
        private matchmakingService: MatchmakingService,
        private cheatModeService: CheatModeService,
        private chatService: ChatService,
        private hintService: HintService
    ) {}

    get leftCanvasContext() {
        return this.leftCanvas.nativeElement.getContext('2d');
    }

    get rightCanvasContext() {
        return this.rightCanvas.nativeElement.getContext('2d');
    }

    get isOneVersusOne() {
        return this.matchmakingService.is1vs1Mode;
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
    }

    sendSystemMessageToChat(message: string) {
        this.chat.sendSystemMessage(message);
    }

    ngOnDestroy(): void {
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

            const abortedGameMessage = ' a abandonné la partie';

            if (this.isPlayer2Win(match)) {
                this.chat.sendSystemMessage(this.player1.toUpperCase() + abortedGameMessage);
                this.onWinGame(this.player2.toUpperCase(), this.isWinByDefault);
            } else if (this.isPlayer1Win(match)) {
                this.chat.sendSystemMessage(this.player2.toUpperCase() + abortedGameMessage);
                this.onWinGame(this.player1.toUpperCase(), this.isWinByDefault);
            }
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
                    this.startTimer();
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
        this.timeInSeconds = 0;
    }

    onMouseDown(event: MouseEvent) {
        const coordinateClick: Vector2 = { x: event.offsetX, y: Math.abs(event.offsetY - CANVAS_HEIGHT) };
        if (this.canvasIsClickable) {
            this.socketService.send('validateDifference', {
                foundDifferences: this.foundDifferences,
                position: coordinateClick,
                isPlayer1: this.matchmakingService.isSoloMode ? true : this.matchmakingService.isPlayer1,
            });
            this.errorMessage.nativeElement.style.left = event.clientX + 'px';
            this.errorMessage.nativeElement.style.top = event.clientY + 'px';
            this.cheatModeService.focusKeyEvent(this.cheat);
        }
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
                        this.differencesFound1++;
                        if (!this.matchmakingService.isSoloMode) {
                            message += ' par ' + this.player1.toUpperCase();
                        }
                    } else {
                        message += ' par ' + this.player2.toUpperCase();
                        this.differencesFound2++;
                    }
                    this.sendSystemMessageToChat(message);
                    this.foundDifferences = data.foundDifferences;
                    this.onFindDifference();

                    if (this.matchmakingService.is1vs1Mode) {
                        if (this.differencesFound1 >= this.minDifferences) {
                            this.onWinGame(this.matchmakingService.player1Username, !this.isWinByDefault);
                        } else if (this.differencesFound2 >= this.minDifferences)
                            this.onWinGame(this.matchmakingService.player2Username, !this.isWinByDefault);
                    } else if (this.matchmakingService.isSoloMode) {
                        if (this.differencesFound1 >= this.totalDifferences) {
                            this.onWinGame(this.matchmakingService.player1Username, !this.isWinByDefault);
                        }
                    }
                } else {
                    this.onFindWrongDifference(data.isPlayer1);
                }
            },
        );
        this.socketService.on('messageBetweenPlayers', (data: { username: string; message: string; sentByPlayer1: boolean }) => {
            this.chat.messages.push({
                text: data.message,
                username: data.username,
                sentBySystem: false,
                sentByPlayer1: data.sentByPlayer1,
                sentByPlayer2: !data.sentByPlayer1,
                sentTime: Date.now(),
            });
            this.chatService.scrollToBottom(this.chat.chat);
            this.chat.newMessage = '';
        });
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
        this.errorMessage.nativeElement.style.display = 'block';
        this.leftCanvas.nativeElement.style.pointerEvents = 'none';
        this.rightCanvas.nativeElement.style.pointerEvents = 'none';
        this.showErrorText();
        this.playSound(false);
        this.cheatModeService.focusKeyEvent(this.cheat);
        this.sendSystemMessageToChat(message);
    }

    showErrorText() {
        setTimeout(() => {
            this.errorMessage.nativeElement.style.display = 'none';
            this.leftCanvas.nativeElement.style.pointerEvents = 'auto';
            this.rightCanvas.nativeElement.style.pointerEvents = 'auto';
        }, MILLISECOND_TO_SECONDS);
    }

    onFindDifference() {
        this.playSound(true);
        this.refreshModifiedImage();
        if (this.isCheating) {
            this.stopCheating();
            this.cheatMode();
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

    gameOver() {
        this.timerElement.stopTimer();
        this.socketService.disconnect();
        this.socketService.send('gameFinished', {
            minutesElapsed: Math.floor(this.timeInSeconds / MINUTE_TO_SECONDS),
            secondsElapsed: Math.floor(this.timeInSeconds % MINUTE_TO_SECONDS),
        });
    }

    onQuitGame() {
        this.popUpElement.showConfirmationPopUp();
    }

    onWinGame(winningPlayer: string, isWinByDefault: boolean) {
        this.gameOver();
        this.popUpElement.showGameOverPopUp(winningPlayer, isWinByDefault, this.matchmakingService.isSoloMode);
    }

    handleEvents(event: KeyboardEvent) {
        if (this.matchmakingService.isSoloMode || (this.chat && document.activeElement !== this.chat.input.nativeElement)) {
            if (event.key === 't') {
                if (this.letterTPressed) {
                    this.cheatMode();
                } else {
                    this.stopCheating();
                    this.putCanvasIntoInitialState();
                }
                this.letterTPressed = !this.letterTPressed;
            }
            // if (event.key === 'i'){ 
            //     this.handleHintMode();
            // }
        }
    }
    
    handleHintMode(){
        if (this.hintService.maxGivenHints !== 0) {
            this.hintService.showHint(this.rightCanvas, 
                this.rightCanvasContext as CanvasRenderingContext2D, this.currentModifiedImage, this.game.modifiedImage, 
                {gameData: this.game.gameData, hints: this.hintService.maxGivenHints, diffs: this.foundDifferences});
            this.hintService.decrement();    
            this.timeInSeconds = this.hintService.handleHint(this.chat, this.timeInSeconds);
            this.hintService.showMessage(this.penaltyMessage);}
    }

    cheatMode() {
        this.backgroundColor = '#66FF99';
        const newImage = this.imageManipulationService.getModifiedImageWithoutDifferences(
            this.game.gameData,
            { originalImage: this.game.originalImage, modifiedImage: this.game.modifiedImage },
            this.foundDifferences,
        );
        this.showHiddenDifferences(newImage);
        this.isCheating = !this.isCheating;
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

    stopCheating() {
        this.backgroundColor = '';
        this.cheatModeService.stopCheating(this.intervalIDLeft as number, this.intervalIDRight as number);
        this.isCheating = !this.isCheating;
    }

    putCanvasIntoInitialState() {
        this.cheatModeService.putCanvasIntoInitialState(
            { originalImage: this.game.originalImage, currentModifiedImage: this.currentModifiedImage },
            { leftContext: this.leftCanvasContext as CanvasRenderingContext2D, rightContext: this.rightCanvasContext as CanvasRenderingContext2D },
        );
    }
}
