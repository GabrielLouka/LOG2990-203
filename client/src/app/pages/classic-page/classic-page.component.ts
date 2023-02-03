import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SocketClientService } from '@app/services/socket-client.service';

@Component({
    selector: 'app-classic-page',
    templateUrl: './classic-page.component.html',
    styleUrls: ['./classic-page.component.scss'],
})
export class ClassicPageComponent implements OnInit {
    title = 'JEUX CLASSIQUE';
    timeInSeconds = 3000;
    matchId: string | null;

    constructor(public socketService: SocketClientService, private route: ActivatedRoute) {}

    get socketId() {
        return this.socketService.socket.id ? this.socketService.socket.id : '';
    }

    ngOnInit(): void {
        this.matchId = this.route.snapshot.paramMap.get('id');
        this.connect();
        this.socketService.send('joinRoom', this.matchId);
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
