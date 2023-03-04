/* eslint-disable @typescript-eslint/no-magic-numbers */
import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatComponent } from '@app/components/chat/chat.component';
import { PopUpComponent } from '@app/components/pop-up/pop-up.component';
import { TimerComponent } from '@app/components/timer/timer.component';
import { AuthService } from '@app/services/auth.service';
import { CommunicationService } from '@app/services/communication.service';
import { ImageManipulationService } from '@app/services/image-manipulation.service';
import { MatchmakingService } from '@app/services/matchmaking.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { GameData } from '@common/game-data';
import { Match } from '@common/match';
import { MatchStatus } from '@common/match-status';
import { MatchType } from '@common/match-type';
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
    debugDisplayMessage: BehaviorSubject<string> = new BehaviorSubject<string>('');
    timeInSeconds = 0;
    matchId: string;
    currentGameId: string | null;
    game: { gameData: GameData; originalImage: Buffer; modifiedImage: Buffer };
    originalImage: File | null;
    modifiedImage: File | null;
    foundDifferences: boolean[];
    foundDifferences1: boolean[];
    foundDifferences2: boolean[];
    mode1vs1: boolean = true;
    differencesFound: number = 0;
    totalDifferences: number = 0;
    gameTitle: string = '';
    currentModifiedImage: Buffer;
    winScreenTitle: string = 'Félicitations !';
    winScreenMessage: string = 'Tu as trouvé toutes les différences. GG WP. !';
    differencesFound1: number = 0;
    differencesFound2: number = 0;

    // eslint-disable-next-line max-params
    constructor(
        public socketService: SocketClientService,
        public communicationService: CommunicationService,
        private route: ActivatedRoute,
        private auth: AuthService,
        private imageManipulationService: ImageManipulationService,
        private matchmakingService: MatchmakingService,
    ) {}

    get socketId() {
        return this.socketService.socket.id ? this.socketService.socket.id : '';
    }

    get leftCanvasContext() {
        return this.leftCanvas.nativeElement.getContext('2d');
    }

    get rightCanvasContext() {
        return this.rightCanvas.nativeElement.getContext('2d');
    }

    get is1vs1Mode() {
        return this.matchmakingService.getCurrentMatch()?.matchType === MatchType.OneVersusOne;
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

    handleMatchUpdate(match: Match | null) {
        if (match !== null) {
            // eslint-disable-next-line no-console
            console.log('Match updated classic ' + JSON.stringify(match));
            this.matchId = this.matchmakingService.getCurrentMatch()?.matchId as string;
            if (match.matchStatus === MatchStatus.InProgress) {
                if (match.player1 == null) {
                    window.alert('Player 1 left the game');
                } else if (match.player2 == null) {
                    window.alert('Player 2 left the game');
                }
            }

            if (match.matchStatus === MatchStatus.Player1Win) {
                this.showWinPopup(true);
                this.gameOver();
            } else if (match.matchStatus === MatchStatus.Player2Win) {
                this.showWinPopup(false);
                this.gameOver();
            }
        }
    }

    ngAfterViewInit(): void {
        const leftCanvasContext = this.leftCanvasContext;
        const rightCanvasContext = this.rightCanvasContext;
        if (leftCanvasContext !== null && rightCanvasContext !== null) {
            this.getInitialImagesFromServer();
        }
    }

    getInitialImagesFromServer() {
        // retrieve the game id from the url
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
        this.foundDifferences1 = new Array(this.game.gameData.nbrDifferences).fill(false);
        this.foundDifferences2 = new Array(this.game.gameData.nbrDifferences).fill(false);
    }

    onMouseDown(event: MouseEvent) {
        const coordinateClick: Vector2 = { x: event.offsetX, y: Math.abs(event.offsetY - 480) };
        if (this.matchmakingService.getCurrentMatch()?.matchType === MatchType.Solo) {
            this.socketService.send('validateDifference', { foundDifferences: this.foundDifferences1, position: coordinateClick, isPlayer1: true });
        } else if (this.matchmakingService.getCurrentMatch()?.matchType === MatchType.OneVersusOne) {
            if (this.socketId === this.matchmakingService.getCurrentMatch()?.player1?.playerId) {
                this.socketService.send('validateDifference', {
                    foundDifferences: this.foundDifferences1,
                    position: coordinateClick,
                    isPlayer1: true,
                });
            } else {
                this.socketService.send('validateDifference', {
                    foundDifferences: this.foundDifferences2,
                    position: coordinateClick,
                    isPlayer1: false,
                });
            }
        }
        this.errorMessage.nativeElement.style.left = event.clientX + 'px';
        this.errorMessage.nativeElement.style.top = event.clientY + 'px';
    }

    requestStartGame() {
        this.socketService.send('registerGameData', { gameData: this.game.gameData });
        // eslint-disable-next-line no-console
        console.log('requestStartGame ' + this.auth.registeredUserName());
    }

    addServerSocketMessagesListeners() {
        if (!this.socketService.isSocketAlive()) window.alert('Error : socket not connected');

        this.socketService.on(
            'validationReturned',
            (data: { foundDifferences: boolean[]; isValidated: boolean; foundDifferenceIndex: number; isPlayer1: boolean }) => {
                if (data.isValidated) {
                    if (data.isPlayer1) {
                        this.foundDifferences1 = data.foundDifferences;
                        this.differencesFound1++;
                    } else {
                        this.foundDifferences2 = data.foundDifferences;
                        this.differencesFound2++;
                    }
                    this.onFindDifference();

                    if (this.differencesFound >= this.totalDifferences) this.onWinGame();
                } else {
                    this.onFindWrongDifference();
                }
            },
        );
        this.socketService.on('messageBetweenPlayer', (data: { username: string; message: string }) => {
            this.chat.messages.push({ text: data.message, username: data.username, sentBySystem: false });
            this.chat.scrollToBottom();
            this.chat.newMessage = '';
        });
    }

    onFindWrongDifference() {
        const message = `Erreur par ${this.auth.registeredUserName().toUpperCase()}`;
        this.errorMessage.nativeElement.style.display = 'block';
        this.leftCanvas.nativeElement.style.pointerEvents = 'none';
        this.rightCanvas.nativeElement.style.pointerEvents = 'none';
        this.showErrorText();
        this.playErrorSound();
        this.sendSystemMessageToChat(message);
    }

    showErrorText() {
        setTimeout(() => {
            this.errorMessage.nativeElement.style.display = 'none';
            this.leftCanvas.nativeElement.style.pointerEvents = 'auto';
            this.rightCanvas.nativeElement.style.pointerEvents = 'auto';
        }, 1000);
    }

    onFindDifference() {
        const message = `Différence trouvée par ${this.auth.registeredUserName().toUpperCase()}`;

        this.playSuccessSound();
        this.refreshModifiedImage();
        this.sendSystemMessageToChat(message);
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

    showWinPopup(player1Win: boolean) {
        this.winScreenTitle = player1Win ? 'Le joueur 1 a gagné' : 'Le joueur 2 a gagné';
        this.winScreenMessage = player1Win
            ? this.matchmakingService.getCurrentMatch()?.player1?.username + ' remporte la partie. Nice !'
            : this.matchmakingService.getCurrentMatch()?.player2?.username + ' remporte la partie. Excellent !';
    }

    gameOver() {
        this.timerElement.stopTimer();
        this.socketService.disconnect();
        this.socketService.send('gameFinished', {
            minutesElapsed: Math.floor(this.timeInSeconds / 60),
            secondsElapsed: Math.floor(this.timeInSeconds % 60),
        });
    }

    onQuitGame() {
        this.popUpElement.showConfirmationPopUp();
    }

    // Called when the player wins the game
    onWinGame() {
        this.sendSystemMessageToChat('Damn, you are goated');
        this.gameOver();
        this.popUpElement.showGameOverPopUp();
    }
}
