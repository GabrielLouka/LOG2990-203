/* eslint-disable no-console */
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { MatchmakingService } from '@app/services/matchmaking.service';
import { SocketClientService } from '@app/services/socket-client.service';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
})
export class ChatComponent {
    @ViewChild('chat') chat: ElementRef;
    @Input() idOfTheGame: string | undefined;
    messages: {
        text: string;
        username: string;
        sentBySystem: boolean;
        sentTime: number;
    }[] = [];
    newMessage = '';

    constructor(private readonly socketService: SocketClientService, private matchmakingService: MatchmakingService) {}

    get socketId() {
        return this.socketService.socket.id ? this.socketService.socket.id : '';
    }

    get isPlayer1() {
        return this.socketId === this.matchmakingService.getCurrentMatch()?.player1?.playerId;
    }

    get currentMatchPlayer1Username() {
        return this.matchmakingService.getCurrentMatch()?.player1?.username as string;
    }

    get currentMatchPlayer2Username() {
        return this.matchmakingService.getCurrentMatch()?.player2?.username as string;
    }

    sendMessage() {
        const currentPlayer = this.isPlayer1 ? this.currentMatchPlayer1Username : this.currentMatchPlayer2Username;
        this.socketService.socket.emit('sendingMessage', {
            msg: this.newMessage,
            idGame: this.idOfTheGame,
            username: currentPlayer,
            messageSentTime: Date.now(),
        });
    }

    isTextValid(newMessage: string) {
        newMessage = newMessage.replace(/\s/g, ''); // Replace all space in a string
        if (newMessage === '' || newMessage === ' ' || newMessage === null) {
            return false;
        }
        return true;
    }

    sendSystemMessage(message: string) {
        this.messages.push({
            text: message,
            username: 'System',
            sentBySystem: true,
            sentTime: Date.now(),
        });
        this.scrollToBottom();
        this.newMessage = '';
    }

    scrollToBottom() {
        setTimeout(() => {
            this.chat.nativeElement.scrollTop = this.chat.nativeElement.scrollHeight;
        });
    }
}
