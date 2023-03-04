/* eslint-disable no-console */
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { AuthService } from '@app/services/auth.service';
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
    }[] = [];
    newMessage = '';
    username = this.auth.registeredUserName();

    constructor(private auth: AuthService, private readonly socketService: SocketClientService) {}
    sendMessage() {
        this.socketService.socket.emit('sendingMessage', { msg: this.newMessage, idGame: this.idOfTheGame, username: this.username });
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
