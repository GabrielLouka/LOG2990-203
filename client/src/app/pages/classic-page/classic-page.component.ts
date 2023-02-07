/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatComponent } from '@app/components/chat/chat.component';
import { AuthService } from '@app/services/auth.service';
import { CommunicationService } from '@app/services/communication.service';
import { MouseHandlerService } from '@app/services/mouse-handler.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { GameData } from '@common/game-data';
import { Vector2 } from '@common/vector2';
import { Buffer } from 'buffer';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-classic-page',
    templateUrl: './classic-page.component.html',
    styleUrls: ['./classic-page.component.scss'],
})
export class ClassicPageComponent implements AfterViewInit, OnInit {
    @ViewChild('originalImage', { static: true }) leftCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('modifiedImage', { static: true }) rightCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('chat') chat: ChatComponent;
    @ViewChild('errorMessage') errorMessage: ElementRef;
    @ViewChild('bgModal') modal!: ElementRef;
    @ViewChild('successSound', { static: true }) successSound: ElementRef<HTMLAudioElement>;
    debugDisplayMessage: BehaviorSubject<string> = new BehaviorSubject<string>('');
    timeInSeconds = 0;
    matchId: string | null;
    currentGameId: string | null;
    game: { gameData: GameData; originalImage: Buffer; modifiedImage: Buffer };
    originalImage: File | null;
    modifiedImage: File | null;
    foundDifferences: boolean[];
    differencesFound: number = 0;
    totalDifferences: number = 0;
    title: string = '';

    constructor(
        public socketService: SocketClientService,
        public mouseService: MouseHandlerService,
        public communicationService: CommunicationService,
        private route: ActivatedRoute,
        private auth: AuthService,
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

    ngOnInit(): void {
        this.currentGameId = this.route.snapshot.paramMap.get('id');
        this.joinServerRoom();
    }
    addMessageToChat(message: string) {
        this.chat.addMessage(message);
    }

    showPopUp() {
        this.modal.nativeElement.style.display = 'flex';
    }

    async playErrorSound() {
        this.successSound.nativeElement.currentTime = 0;
        this.successSound.nativeElement.play();
    }

    loadCanvasImages(srcImg: string, context: CanvasRenderingContext2D) {
        const img = new Image();
        img.src = srcImg;
        img.onload = () => {
            context.drawImage(img, 0, 0, 640, 480, 0, 0, 640, 480);
            this.addMessageToChat('Image loaded successfully');
        };
        img.onerror = (error) => {
            this.addMessageToChat('Failed to load image' + error);
            console.error('Failed to load image', error);
        };
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
                    const img1Source = `data:image/bmp;base64,${Buffer.from(this.game.originalImage).toString('base64')}`;
                    const img2Source = `data:image/bmp;base64,${Buffer.from(this.game.modifiedImage).toString('base64')}`;
                    this.loadImagesToCanvas(img1Source, img2Source);
                    this.title = this.game.gameData.name;
                }
            },
            error: (err: HttpErrorResponse) => {
                const responseString = `Server Error : ${err.message}`;
                console.log(responseString);
            },
        });
    }

    loadImagesToCanvas(imgSource1: string, imgSource2: string) {
        const leftCanvasContext = this.leftCanvasContext;
        const rightCanvasContext = this.rightCanvasContext;
        if (leftCanvasContext !== null && rightCanvasContext !== null) {
            this.loadCanvasImages(imgSource1, leftCanvasContext);
            this.loadCanvasImages(imgSource2, rightCanvasContext);
        }
        this.foundDifferences = new Array(this.game.gameData.nbrDifferences).fill(false);
        this.totalDifferences = this.game.gameData.nbrDifferences;
        this.addMessageToChat('Size of foundDifferences array: ' + this.foundDifferences.length);
        this.socketService.send('launchGame', { gameData: this.game.gameData, username: this.auth.registerUserName() });
    }

    onMouseDown(event: MouseEvent) {
        const coordinateClick: Vector2 = { x: event.offsetX, y: Math.abs(event.offsetY - 480) };
        this.mouseService.onMouseDown(coordinateClick);
        this.socketService.send('validateDifference', { foundDifferences: this.foundDifferences, position: coordinateClick });

        this.errorMessage.nativeElement.style.left = event.clientX + 'px';
        this.errorMessage.nativeElement.style.top = event.clientY + 'px';
    }

    joinServerRoom() {
        if (this.socketService.isSocketAlive()) this.socketService.disconnect();

        this.socketService.connect();
        this.addServerSocketMessagesListeners();
    }

    addServerSocketMessagesListeners() {
        this.socketService.on('connect', () => {
            this.addMessageToChat(`Connexion par WebSocket sur le socket ${this.socketId}`);
        });
        // Afficher le message envoyé lors de la connexion avec le serveur
        this.socketService.on('hello', (message: string) => {
            this.addMessageToChat(message);
        });
        this.socketService.on('matchJoined', (message: string) => {
            this.addMessageToChat(message);
        });
        this.socketService.on('validationReturned', (data: { foundDifferences: boolean[]; isValidated: boolean; foundDifferenceIndex: number }) => {
            if (data.isValidated) {
                this.addMessageToChat('Well done king.');
                this.foundDifferences = data.foundDifferences;

                if (this.differencesFound + 1 >= this.totalDifferences) {
                    this.onWinGame();
                } else {
                    this.onFindDifference(data.foundDifferenceIndex);
                }
            } else {
                this.onFindWrongDifference();
            }
        });
    }

    onFindWrongDifference() {
        this.errorMessage.nativeElement.style.display = 'block';
        this.leftCanvas.nativeElement.style.pointerEvents = 'none';
        this.rightCanvas.nativeElement.style.pointerEvents = 'none';
        this.playErrorSound();

        setTimeout(() => {
            this.errorMessage.nativeElement.style.display = 'none';
            this.leftCanvas.nativeElement.style.pointerEvents = 'auto';
            this.rightCanvas.nativeElement.style.pointerEvents = 'auto';
        }, 1000);
    }

    onFindDifference(differenceIndex: number) {
        this.differencesFound++;
        this.addMessageToChat('You found difference #' + differenceIndex + '! (' + this.differencesFound + '/' + this.totalDifferences + ')');
        this.playErrorSound();
    }

    // Called when the player wins the game
    onWinGame() {
        this.addMessageToChat('Damn, you are goated');
        this.socketService.send('gameFinished', {
            minutesElapsed: Math.floor(this.timeInSeconds / 60),
            secondsElapsed: Math.floor(this.timeInSeconds % 60),
        });
        this.differencesFound++;
        this.showPopUp();
        this.socketService.disconnect();
    }
}
