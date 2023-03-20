import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatchmakingService } from '@app/services/matchmaking-service/matchmaking.service';
import { SocketClientService } from '@app/services/socket-client-service/socket-client.service';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
})
export class ChatComponent {
    @ViewChild('chat') chat: ElementRef;
    @ViewChild('inputElement') input: ElementRef;

    messages: {
        text: string;
        username: string;
        sentBySystem: boolean;
        sentByPlayer1: boolean;
        sentByPlayer2: boolean;
        sentTime: number;
    }[] = [];
    newMessage = '';
    title: string = 'MANIA CHAT';

    constructor(private readonly socketService: SocketClientService, private matchmakingService: MatchmakingService) {}

    get isOneVersusOne(): boolean {
        return this.matchmakingService.is1vs1Mode;
    }

    sendMessage() {
        if (this.isValidText(this.newMessage)) {
            const currentPlayer = this.matchmakingService.isPlayer1
                ? this.matchmakingService.player1Username
                : this.matchmakingService.player2Username;
            this.socketService.socket.emit('sendingMessage', {
                message: this.newMessage,
                idGame: this.matchmakingService.currentMatchId,
                username: currentPlayer,
                messageSentTime: Date.now(),
                sentByPlayer1: this.matchmakingService.isPlayer1,
            });
        }
    }

    isValidText(newMessage: string) {
        newMessage = newMessage.replace(/\s/g, ''); // Replace all space in a string

        if (newMessage === '' || newMessage === ' ' || newMessage === null) {
            return false;
        }
        return true;
    }

    sendSystemMessage(message: string) {
        this.messages.push({
            text: message,
            username: 'SYSTEM',
            sentBySystem: true,
            sentByPlayer1: false,
            sentByPlayer2: false,
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
