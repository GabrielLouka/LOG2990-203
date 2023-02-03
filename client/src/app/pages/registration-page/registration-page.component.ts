import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '@app/services/auth.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-registration-page',
    templateUrl: './registration-page.component.html',
    styleUrls: ['./registration-page.component.scss'],
})
export class RegistrationPageComponent implements OnInit {
    title = 'Register Page';
    username: string | null | undefined;
    id: string | null;
    debugDisplayMessage: BehaviorSubject<string> = new BehaviorSubject<string>('');
    registrationForm = new FormGroup({
        username: new FormControl('', Validators.compose([Validators.required, Validators.pattern('^[a-zA-Z0-9]{3,15}$')])),
    });

    constructor(private auth: AuthService, private route: ActivatedRoute, public socketService: SocketClientService) {}

    get socketId() {
        return this.socketService.socket.id ? this.socketService.socket.id : '';
    }

    ngOnInit(): void {
        this.connect();
        this.id = this.route.snapshot.paramMap.get('id');
        // this.debugDisplayMessage.next(this.id!);
    }
    registerUser() {
        this.auth.registerUser(this.registrationForm.value.username);
        this.username = this.registrationForm.value.username;
        this.debugDisplayMessage.next('yo');
        // this.debugDisplayMessage.next(this.registrationForm.value.username!);
        this.socketService.send('launchGame', { gameId: this.id, username: this.registrationForm.value.username });
    }

    connect() {
        if (!this.socketService.isSocketAlive()) {
            this.socketService.connect();
            this.debugDisplayMessage.next('hey');
            this.configureBaseSocketFeatures();
            this.debugDisplayMessage.next(this.socketId);
        }
    }
    configureBaseSocketFeatures() {
        this.socketService.on('connect', () => {
            this.debugDisplayMessage.next(`Connexion par WebSocket sur le socket ${this.socketId}`);
        });
        // Afficher le message envoyé lors de la connexion avec le serveur
        this.socketService.on('hello', (message: string) => {
            this.debugDisplayMessage.next(message);
        });
        this.socketService.on('matchJoined', (message: string) => {
            this.debugDisplayMessage.next(message);
        });
    }

    getUser() {
        return this.auth.registerUserName();
    }
}
