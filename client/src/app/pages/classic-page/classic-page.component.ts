/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
    debugDisplayMessage: BehaviorSubject<string> = new BehaviorSubject<string>('');
    title = 'JEUX CLASSIQUE';
    timeInSeconds = 0;
    matchId: string | null;
    currentGameId: string | null;
    game: { gameData: GameData; originalImage: Buffer; modifiedImage: Buffer };
    originalImage: File | null;
    modifiedImage: File | null;
    foundDifferences: boolean[];
    differencesFound : number = 0;
    totalDifferences : number = 0;
    
    constructor(
        public socketService: SocketClientService,
        public mouseService: MouseHandlerService,
        public communicationService: CommunicationService,
        private route: ActivatedRoute,
        private auth: AuthService,
    ) {} // private route: ActivatedRoute, // private readonly uploadImagesService: UploadImagesService,

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
        this.connect();
    }

    loadCanvasImages(srcImg: string, context: CanvasRenderingContext2D) {
        const img = new Image();
        img.src = srcImg;
        img.onload = () => {
            context.drawImage(img, 0, 0, 640, 480, 0, 0, 640, 480);
            console.log('Image loaded sucessfully');
        };
        img.onerror = (error) => {
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
                }
            },
            error: (err: HttpErrorResponse) => {
                const responseString = `Server Error : ${err.message}`;
                // eslint-disable-next-line no-console
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
        console.log({ gameId: this.currentGameId, username: this.auth.registerUserName() });
        this.foundDifferences = new Array(this.game.gameData.nbrDifferences).fill(false);
        this.totalDifferences = this.game.gameData.nbrDifferences;
        console.log('Size of foundDifferences array: ' + this.foundDifferences.length);
        this.socketService.send('launchGame', { gameData: this.game.gameData, username: this.auth.registerUserName() });
    }

    onMouseDown(event: MouseEvent) {
        const coordinateClick: Vector2 = { x: event.offsetX, y: Math.abs(event.offsetY - 480) };
        this.mouseService.onMouseDown(coordinateClick);
        this.socketService.send('validateDifference', { foundDifferences: this.foundDifferences, position: coordinateClick });
    }

    connect() {
        if (!this.socketService.isSocketAlive()) {
            console.log('in connect');
            this.socketService.connect();
            this.configureBaseSocketFeatures();
        }
    }
    configureBaseSocketFeatures() {
        this.socketService.on('connect', () => {
            console.log(`Connexion par WebSocket sur le socket ${this.socketId}`);
        });
        // Afficher le message envoyé lors de la connexion avec le serveur
        this.socketService.on('hello', (message: string) => {
            console.log(message);
        });
        this.socketService.on('matchJoined', (message: string) => {
            console.log(message);
        });
        this.socketService.on('validationReturned', (data: {foundDifferences : boolean[], isValidated: boolean}) => {
            if (data.isValidated)
            {
            console.log('Well done king.');
            for (const difference of data.foundDifferences) {
                console.log(difference);
            }
            this.foundDifferences = data.foundDifferences;
            
            if (this.differencesFound + 1 >= this.totalDifferences)
            {
                console.log('Damn, you are goated');
                this.socketService.send('gameFinished', { minutesElapsed: Math.floor(this.timeInSeconds / 60), secondsElapsed: Math.floor(this.timeInSeconds % 60) });
 
            }
            else {
                this.differencesFound++;
                console.log('You have found the following number of differences: ' + this.differencesFound);
            }
            
        }
        else {
            console.log('Nope.');
        }

        });

    }
}
