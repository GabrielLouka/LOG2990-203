/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';
import { AuthService } from '@app/services/auth.service';
@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
})
export class ChatComponent {
    messages: any[] = [];
    newMessage = '';
    text: any;
    sentByplayer1: boolean;
    sentByPlayer2: boolean;

    username = this.auth.registerUserName();

    constructor(private auth: AuthService) {}

    sendMessage(playerNumber: number) {
        this.messages.push({
            text: this.newMessage,
            username: `${this.username}`,
            sentByPlayer1: playerNumber === 1,
            sentByPlayer2: playerNumber === 2,
        });
        this.newMessage = '';
    }

    addMessage(message: string) {
        this.messages.push({
            text: message,
            username: 'System',
            sentByPlayer1: true,
            sentByPlayer2: false,
        });
        this.newMessage = '';
    }
}
