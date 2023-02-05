/* eslint-disable @typescript-eslint/no-explicit-any */
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Coordinate } from '@app/interfaces/coordinate';
import { MouseHandlerService } from '@app/services/mouse-handler.service';
import { SocketClientService } from '@app/services/socket-client.service';

@Component({
    selector: 'app-classic-page',
    templateUrl: './classic-page.component.html',
    styleUrls: ['./classic-page.component.scss'],
})
export class ClassicPageComponent implements AfterViewInit {
    @ViewChild('originalImage', { static: true }) leftCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('modifiedImage', { static: true }) rightCanvas: ElementRef<HTMLCanvasElement>;

    title = 'JEUX CLASSIQUE';
    timeInSeconds = 3000;
    matchId: string | null;
    game: any;
    originalImage: File | null;
    modifiedImage: File | null;

    constructor(public socketService: SocketClientService, public mouseService: MouseHandlerService) {} // private route: ActivatedRoute, // private readonly uploadImagesService: UploadImagesService,

    get socketId() {
        return this.socketService.socket.id ? this.socketService.socket.id : '';
    }

    get leftCanvasContext() {
        return this.leftCanvas.nativeElement.getContext('2d');
    }

    get rightCanvasContext() {
        return this.rightCanvas.nativeElement.getContext('2d');
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
            // TODO aller get avec le serveur
            this.loadCanvasImages('/assets/img/1.bmp', leftCanvasContext);
            this.loadCanvasImages('/assets/img/2.bmp', rightCanvasContext);
        }
    }

    onMouseDown(event: MouseEvent) {
        const coordinateClick: Coordinate = { x: event.offsetX, y: Math.abs(event.offsetY - 480) };
        this.mouseService.onMouseDown(coordinateClick);
    }

    connect() {
        if (!this.socketService.isSocketAlive()) {
            this.socketService.connect();
            this.configureBaseSocketFeatures();
        }
    }

    configureBaseSocketFeatures() {
        this.socketService.on('connect', () => {
            console.log(`Connexion par WebSocket sur le socket ${this.socketId}`);
        });
        // // Afficher le message envoyé lors de la connexion avec le serveur
        // this.socketService.on('hello', (message: string) => {
        //     this.serverMessage = message;
        // });

        // // Afficher le message envoyé à chaque émission de l'événement "clock" du serveur
        // this.socketService.on('clock', (time: Date) => {
        //     this.serverClock = time;
        // });

        // // Gérer l'événement envoyé par le serveur : afficher le résultat de validation
        // this.socketService.on('wordValidated', (isValid: boolean) => {
        //     const validationString = `Le mot est ${isValid ? 'valide' : 'invalide'}`;
        //     this.serverValidationResult = validationString;
        // });

        // // Gérer l'événement envoyé par le serveur : afficher le message envoyé par un client connecté
        // this.socketService.on('massMessage', (broadcastMessage: string) => {
        //     this.serverMessages.push(broadcastMessage);
        // });

        // // Gérer l'événement envoyé par le serveur : afficher le message envoyé par un membre de la salle
        // this.socketService.on('roomMessage', (roomMessage: string) => {
        //     this.roomMessages.push(roomMessage);
        // });
    }
}
