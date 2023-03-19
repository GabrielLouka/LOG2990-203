/* eslint-disable max-lines */
import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatComponent } from '@app/components/chat/chat.component';
import { PopUpComponent } from '@app/components/pop-up/pop-up.component';
import { TimerComponent } from '@app/components/timer/timer.component';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { ImageManipulationService } from '@app/services/image-manipulation-service/image-manipulation.service';
import { MatchManagerService } from '@app/services/match-manager-service/match-manager.service';
import { SocketClientService } from '@app/services/socket-client-service/socket-client.service';
import { GameData } from '@common/game-data';
import { Match } from '@common/match';
import { MatchStatus } from '@common/match-status';
import { CANVAS_HEIGHT, MILLISECOND_TO_SECONDS, MINUTE_TO_SECONDS } from '@common/utils/env';
import { Vector2 } from '@common/vector2';
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
    @ViewChild('popUpElement') popUpElement: PopUpComponent;
    @ViewChild('errorMessage') errorMessage: ElementRef;
    @ViewChild('successSound', { static: true }) successSound: ElementRef<HTMLAudioElement>;
    @ViewChild('errorSound', { static: true }) errorSound: ElementRef<HTMLAudioElement>;
    @ViewChild('cheatElement') cheat: ElementRef | undefined;
    isLetterTPressed: boolean = true;
    isWinByDefault: boolean = true;
    foundDifferences: boolean[];
    originalImage: File | null;
    modifiedImage: File | null;
    currentGameId: string | null;
    backgroundColor: string = '';
    gameTitle: string = '';
    game: { gameData: GameData; originalImage: Buffer; modifiedImage: Buffer };
    currentModifiedImage: Buffer;
    intervalIDLeft: number | undefined;
    intervalIDRight: number | undefined;
    timeInSeconds: number = 0;
    totalDifferences: number = 0;
    differencesFound: number = 0;
    differencesFound1: number = 0;
    differencesFound2: number = 0;
    // eslint-disable-next-line max-params
    constructor(
        public socketService: SocketClientService,
        public communicationService: CommunicationService,
        private route: ActivatedRoute,
        private imageManipulationService: ImageManipulationService,
        private matchManagerService: MatchManagerService,
    ) {}

    get leftCanvasContext() {
        return this.leftCanvas.nativeElement.getContext('2d');
    }

    get rightCanvasContext() {
        return this.rightCanvas.nativeElement.getContext('2d');
    }

    get isOneVersusOne() {
        return this.matchManagerService.is1vs1Mode;
    }

    getPlayerUsername(isPlayer1: boolean): string {
        if (isPlayer1) return this.matchManagerService.player1Username;
        return this.matchManagerService.player2Username;
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
        this.matchManagerService.onMatchUpdated.add(this.handleMatchUpdate.bind(this));
        window.addEventListener('keydown', this.onCheatMode.bind(this));
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

    handleMatchUpdate(match: Match | null) {
        if (match) {
            const abortedGameMessage = ' a abandonné la partie';

            if (this.isPlayer1Win(match)) {
                this.chat.sendSystemMessage(this.matchManagerService.player2Username.toUpperCase() + abortedGameMessage);
                this.onWinGame(this.matchManagerService.player1Username, this.isWinByDefault);
            } else if (this.isPlayer2Win(match)) {
                this.chat.sendSystemMessage(this.matchManagerService.player1Username.toUpperCase() + abortedGameMessage);
                this.onWinGame(this.matchManagerService.player2Username, this.isWinByDefault);
            }
        }
    }

    ngAfterViewInit(): void {
        const leftCanvasContext = this.leftCanvasContext;
        const rightCanvasContext = this.rightCanvasContext;

        if (leftCanvasContext && rightCanvasContext) {
            this.getInitialImagesFromServer();
        }
        this.focusKeyEvent();
        window.removeEventListener('keydown', this.onCheatMode.bind(this));
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
    }

    onMouseDown(event: MouseEvent) {
        const coordinateClick: Vector2 = { x: event.offsetX, y: Math.abs(event.offsetY - CANVAS_HEIGHT) };

        if (this.matchManagerService.isSoloMode) {
            this.socketService.send('validateDifference', { foundDifferences: this.foundDifferences, position: coordinateClick, isPlayer1: true });
        } else if (this.matchManagerService.is1vs1Mode) {
            this.socketService.send('validateDifference', {
                foundDifferences: this.foundDifferences,
                position: coordinateClick,
                isPlayer1: this.matchManagerService.isPlayer1,
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
                        if (!this.matchManagerService.isSoloMode) {
                            message += ' par ' + this.matchManagerService.player1Username.toUpperCase();
                        }
                    } else {
                        message += ' par ' + this.matchManagerService.player2Username.toUpperCase();
                        this.differencesFound2++;
                    }
                    this.sendSystemMessageToChat(message);
                    this.foundDifferences = data.foundDifferences;
                    this.onFindDifference();

                    if (this.matchManagerService.is1vs1Mode) {
                        if (this.differencesFound1 >= Math.ceil(this.totalDifferences / 2)) {
                            this.onWinGame(this.matchManagerService.player1Username, !this.isWinByDefault);
                        } else if (this.differencesFound2 >= Math.ceil(this.totalDifferences / 2))
                            this.onWinGame(this.matchManagerService.player2Username, !this.isWinByDefault);
                    } else if (this.matchManagerService.isSoloMode) {
                        if (this.differencesFound1 >= this.totalDifferences) {
                            this.onWinGame(this.matchManagerService.player1Username, !this.isWinByDefault);
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

        if (!this.matchManagerService.isSoloMode) {
            if (isPlayer1) {
                message += ' par ' + this.matchManagerService.player1Username.toUpperCase();
            } else {
                message += ' par ' + this.matchManagerService.player1Username.toUpperCase();
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
        window.clearInterval(this.intervalIDLeft);
        window.clearInterval(this.intervalIDRight);
        this.imageManipulationService.loadCurrentImage(this.game.originalImage, this.leftCanvasContext as CanvasRenderingContext2D);
        this.backgroundColor = '';
        this.isLetterTPressed = true;
        this.focusKeyEvent();
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
        this.popUpElement.showGameOverPopUp(winningPlayer, isWinByDefault, this.matchManagerService.isSoloMode);
    }

    focusKeyEvent() {
        if (this.cheat) this.cheat.nativeElement.focus();
    }

    onCheatMode(event: KeyboardEvent) {
        if (this.matchManagerService.isSoloMode || document.activeElement !== this.chat.input.nativeElement) {
            if (event.key === 't') {
                if (this.isLetterTPressed) {
                    this.backgroundColor = '#66FF99';
                    this.cheatMode();
                } else {
                    this.backgroundColor = '';
                    window.clearInterval(this.intervalIDLeft);
                    window.clearInterval(this.intervalIDRight);

                    if (this.currentModifiedImage && this.game.originalImage) {
                        this.imageManipulationService.loadCurrentImage(
                            this.currentModifiedImage,
                            this.rightCanvasContext as CanvasRenderingContext2D,
                        );
                        this.imageManipulationService.loadCurrentImage(this.game.originalImage, this.leftCanvasContext as CanvasRenderingContext2D);
                    }
                }
                this.isLetterTPressed = !this.isLetterTPressed;
            }
        }
    }

    cheatMode() {
        const newImage = this.imageManipulationService.getModifiedImageWithoutDifferences(
            this.game.gameData,
            { originalImage: this.game.originalImage, modifiedImage: this.game.modifiedImage },
            this.foundDifferences,
        );

        if (this.leftCanvasContext && this.rightCanvasContext) {
            this.intervalIDLeft = this.imageManipulationService.alternateOldNewImage(
                this.game.originalImage,
                newImage,
                this.leftCanvasContext as CanvasRenderingContext2D,
            );
            if (this.currentModifiedImage) {
                this.intervalIDRight = this.imageManipulationService.alternateOldNewImage(
                    this.game.originalImage,
                    this.currentModifiedImage,
                    this.rightCanvasContext as CanvasRenderingContext2D,
                );
            } else {
                this.intervalIDRight = this.imageManipulationService.alternateOldNewImage(
                    this.game.originalImage,
                    this.game.modifiedImage,
                    this.rightCanvasContext as CanvasRenderingContext2D,
                );
            }

            this.currentModifiedImage = newImage;
        }
    }
}
