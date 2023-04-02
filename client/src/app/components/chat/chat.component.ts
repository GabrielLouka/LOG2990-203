import { Component, ElementRef, ViewChild } from '@angular/core';
import { ChatService } from '@app/services/chat-service/chat.service';
import { CHAT_TITLE } from '@common/utils/env';

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
    title = CHAT_TITLE;

    constructor(private chatService: ChatService) {}

    get isMode1vs1() {
        return this.chatService.isMode1vs1;
    }

    sendMessage() {
        this.chatService.sendMessage(this.chatService.isPlayer1, this.newMessage);
    }

    sendSystemMessage(message: string) {
        this.chatService.sendMessageFromSystem({ message: message, chat: this.chat, newMessage: this.newMessage }, this.messages);
    }
}
