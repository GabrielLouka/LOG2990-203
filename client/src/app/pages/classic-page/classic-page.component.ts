import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatComponent } from '@app/components/chat/chat.component';
import { PopUpComponent } from '@app/components/pop-up/pop-up.component';
import { TimerComponent } from '@app/components/timer/timer.component';
import { CommunicationService } from '@app/services/communication.service';
import { ImageManipulationService } from '@app/services/image-manipulation.service';
import { MatchmakingService } from '@app/services/matchmaking.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { GameData } from '@common/game-data';
import { Match } from '@common/match';
import { MatchStatus } from '@common/match-status';
import { CANVAS_HEIGHT, HEIGHTH_MILLISECOND, MILLISECOND_TO_SECONDS, MINUTE_TO_SECONDS } from '@common/utils/env';
import { Vector2 } from '@common/vector2';
import { Buffer } from 'buffer';
import { BehaviorSubject } from 'rxjs';

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
    @ViewChild('popUpElement') popUpElement: PopUpComponent;
    @ViewChild('errorMessage') errorMessage: ElementRef;
    @ViewChild('successSound', { static: true }) successSound: ElementRef<HTMLAudioElement>;
    @ViewChild('errorSound', { static: true }) errorSound: ElementRef<HTMLAudioElement>;
    @ViewChild('cheatElement') cheat: ElementRef | undefined;
    // @HostListener('window:keydown.t', ['$event'])
    letterTPressed: boolean = true;
    bgColor = '';
    intervalID: number | undefined;
    debugDisplayMessage: BehaviorSubject<string> = new BehaviorSubject<string>('');
    timeInSeconds = 0;
    matchId: string;
    currentGameId: string | null;
    game: { gameData: GameData; originalImage: Buffer; modifiedImage: Buffer };
    originalImage: File | null;
    modifiedImage: File | null;
    foundDifferences: boolean[];
    mode1vs1: boolean = true;
    differencesFound: number = 0;
    totalDifferences: number = 0;
    gameTitle: string = '';
    currentModifiedImage: Buffer;
    differencesFound1: number = 0;
    differencesFound2: number = 0;
    player1: string = '';
    player2: string = '';
    // eslint-disable-next-line max-params
    constructor(
        public socketService: SocketClientService,
        public communicationService: CommunicationService,
        private route: ActivatedRoute,
        private imageManipulationService: ImageManipulationService,
        private matchmakingService: MatchmakingService,
    ) {}

    get leftCanvasContext() {
        return this.leftCanvas.nativeElement.getContext('2d');
    }

    get rightCanvasContext() {
        return this.rightCanvas.nativeElement.getContext('2d');
    }

    get is1vs1Mode() {
        return this.matchmakingService.is1vs1Mode;
    }

    ngOnInit(): void {
        this.currentGameId = this.route.snapshot.paramMap.get('id');
        this.addServerSocketMessagesListeners();
        this.matchmakingService.onMatchUpdated.add(this.handleMatchUpdate.bind(this));
    }

    sendSystemMessageToChat(message: string) {
        this.chat.sendSystemMessage(message);
    }

    ngOnDestroy(): void {
        this.socketService.disconnect();
    }

    async playErrorSound() {
        this.errorSound.nativeElement.currentTime = 0;
        this.errorSound.nativeElement.volume = 0.3;
        this.errorSound.nativeElement.play();
    }

    async playSuccessSound() {
        this.successSound.nativeElement.currentTime = 0;
        this.successSound.nativeElement.play();
    }

    isPlayer1Win(match: Match): boolean {
        return match.matchStatus === MatchStatus.Player1Win;
    }

    isPlayer2Win(match: Match): boolean {
        return match.matchStatus === MatchStatus.Player2Win;
    }

    handleMatchUpdate(match: Match | null) {
        if (this.player1 === '') {
            this.player1 = this.matchmakingService.currentMatchPlayer1Username;
        }
        if (this.player2 === '') {
            this.player2 = this.matchmakingService.currentMatchPlayer2Username;
        }
        if (match !== null) {
            this.matchId = this.matchmakingService.getCurrentMatch()?.matchId as string;
            const abortedGameMessage = ' a abandonné la partie';
            if (this.isPlayer1Win(match)) {
                this.chat.sendSystemMessage(this.player2.toUpperCase() + abortedGameMessage);
                this.onWinGame(this.player1, true);
            } else if (this.isPlayer2Win(match)) {
                this.chat.sendSystemMessage(this.player1.toUpperCase() + abortedGameMessage);
                this.onWinGame(this.player2, true);
            }
        }
    }

    ngAfterViewInit(): void {
        const leftCanvasContext = this.leftCanvasContext;
        const rightCanvasContext = this.rightCanvasContext;
        if (leftCanvasContext !== null && rightCanvasContext !== null) {
            this.getInitialImagesFromServer();
        }
        this.focusKeyEvent();
    }

    getInitialImagesFromServer() {
        const gameId: string = this.currentGameId ? this.currentGameId : '0';
        const routeToSend = '/games/fetchGame/' + gameId;

        this.communicationService.get(routeToSend).subscribe({
            next: (response) => {
                if (response.body !== null) {
                    const serverResult = JSON.parse(response.body);
                    this.game = serverResult;
                    const img1Source = this.imageManipulationService.getImageSourceFromBuffer(this.game.originalImage);
                    const img2Source = this.imageManipulationService.getImageSourceFromBuffer(this.game.modifiedImage);
                    this.loadImagesToCanvas(img1Source, img2Source);
                    this.requestStartGame();
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
        if (leftCanvasContext !== null && rightCanvasContext !== null) {
            this.imageManipulationService.loadCanvasImages(imgSource1, leftCanvasContext);
            this.imageManipulationService.loadCanvasImages(imgSource2, rightCanvasContext);
        }
        this.foundDifferences = new Array(this.game.gameData.nbrDifferences).fill(false);
        this.totalDifferences = this.game.gameData.nbrDifferences;
    }

    onMouseDown(event: MouseEvent) {
        const coordinateClick: Vector2 = { x: event.offsetX, y: Math.abs(event.offsetY - CANVAS_HEIGHT) };
        if (this.matchmakingService.isSoloMode) {
            this.socketService.send('validateDifference', { foundDifferences: this.foundDifferences, position: coordinateClick, isPlayer1: true });
        } else if (this.matchmakingService.is1vs1Mode) {
            this.socketService.send('validateDifference', {
                foundDifferences: this.foundDifferences,
                position: coordinateClick,
                isPlayer1: this.socketService.socketId === this.matchmakingService.player1SocketId,
            });
        }
        this.errorMessage.nativeElement.style.left = event.clientX + 'px';
        this.errorMessage.nativeElement.style.top = event.clientY + 'px';
        this.focusKeyEvent();
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
                        message += message += ' par ' + this.player2.toUpperCase();
                        this.differencesFound2++;
                    }
                    this.sendSystemMessageToChat(message);
                    this.foundDifferences = data.foundDifferences;
                    this.onFindDifference();

                    if (this.matchmakingService.is1vs1Mode) {
                        if (this.differencesFound1 >= Math.ceil(this.totalDifferences / 2)) {
                            this.onWinGame(this.player1, false);
                        } else if (this.differencesFound2 >= Math.ceil(this.totalDifferences / 2)) this.onWinGame(this.player2, false);
                    } else if (this.matchmakingService.isSoloMode) {
                        if (this.differencesFound1 >= this.totalDifferences) {
                            this.onWinGame(this.player1, false);
                        }
                    }
                } else {
                    this.onFindWrongDifference(data.isPlayer1);
                }
            },
        );
        this.socketService.on('messageBetweenPlayer', (data: { username: string; message: string; sentByPlayer1: boolean }) => {
            this.chat.messages.push({
                text: data.message,
                username: data.username,
                sentBySystem: false,
                sentByPlayer1: data.sentByPlayer1,
                sentByPlayer2: !data.sentByPlayer1,
                sentTime: Date.now(),
            });
            this.chat.scrollToBottom();
            this.chat.newMessage = '';
        });
    }

    onFindWrongDifference(isPlayer1: boolean) {
        let message = 'Erreur';
        if (!this.matchmakingService.isSoloMode) {
            if (isPlayer1) {
                message += ' par ' + this.player1.toUpperCase();
            } else {
                message += ' par ' + this.player2.toUpperCase();
            }
        }
        this.errorMessage.nativeElement.style.display = 'block';
        this.leftCanvas.nativeElement.style.pointerEvents = 'none';
        this.rightCanvas.nativeElement.style.pointerEvents = 'none';
        this.showErrorText();
        this.playErrorSound();
        this.focusKeyEvent();
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
        this.playSuccessSound();
        this.refreshModifiedImage();
        clearInterval(this.intervalID);
        this.bgColor = '';
        this.letterTPressed = true;
        this.focusKeyEvent();
    }

    async refreshModifiedImage() {
        const newImage = this.imageManipulationService.getModifiedImageWithoutDifferences(
            this.game.gameData,
            { originalImage: this.game.originalImage, modifiedImage: this.game.modifiedImage },
            this.foundDifferences,
        );
        if (this.rightCanvasContext !== null) {
            await this.imageManipulationService.blinkDifference(
                this.currentModifiedImage != null ? this.currentModifiedImage : this.game.modifiedImage,
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

    focusKeyEvent() {
        if (this.cheat) {
            this.cheat.nativeElement.focus();
        }
    }

    onCheatMode(event: KeyboardEvent) {
        if (event.code === 'KeyT') {
            if (this.letterTPressed) {
                this.bgColor = '#66FF99';
                this.cheatMode();
            } else {
                this.bgColor = '';
                clearInterval(this.intervalID);
                this.imageManipulationService.loadCurrentImage(this.currentModifiedImage, this.rightCanvasContext as CanvasRenderingContext2D);
            }
            this.letterTPressed = !this.letterTPressed;
        }
    }

    cheatMode() {
        const newImage = this.imageManipulationService.getModifiedImageWithoutDifferences(
            this.game.gameData,
            { originalImage: this.game.originalImage, modifiedImage: this.game.modifiedImage },
            this.foundDifferences,
        );
        if (this.leftCanvasContext && this.rightCanvasContext) {
            this.intervalID = window.setInterval(async () => {
                setTimeout(() => {
                    this.imageManipulationService.alternateOldNewImage(
                        this.game.originalImage,
                        newImage,
                        this.leftCanvasContext as CanvasRenderingContext2D,
                    );
                }, 0);
                setTimeout(() => {
                    this.imageManipulationService.alternateOldNewImage(
                        this.game.originalImage,
                        this.currentModifiedImage,
                        this.rightCanvasContext as CanvasRenderingContext2D,
                    );
                }, 0);
            }, HEIGHTH_MILLISECOND);
            this.currentModifiedImage = newImage;
        }
    }
}
