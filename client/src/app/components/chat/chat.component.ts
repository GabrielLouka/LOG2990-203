/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
})
export class ChatComponent {
    messages: any[] = [];
    newMessage = '';
    text: any;
    username: string;
    sentByplayer1: boolean;
    sentByPlayer2: boolean;

    sendMessage(playerNumber: number) {
        this.messages.push({
            text: this.newMessage,
            username: `Player ${playerNumber}`,
            sentByPlayer1: playerNumber === 1,
            sentByPlayer2: playerNumber === 2,
        });
        this.newMessage = '';
    }
}
