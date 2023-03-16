/* eslint-disable no-console */
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { ChatService } from '@app/services/chat-service/chat.service';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
})
export class ChatComponent {
    @ViewChild('chat') chat: ElementRef;
    @ViewChild('inputElement') input: ElementRef;
    @Input() idOfTheGame: string | undefined;
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

    constructor(/*private readonly socketService: SocketClientService, private matchmakingService: MatchmakingService, */private chatService: ChatService) {}

    // get isPlayer1() {
    //     return this.socketService.socketId === this.matchmakingService.player1SocketId;
    // }

    get isMode1vs1() {
        return this.chatService.isMode1vs1;
    }

    sendMessage() {
        // const currentPlayer = this.isPlayer1
        //     ? this.matchmakingService.currentMatchPlayer1Username
        //     : this.matchmakingService.currentMatchPlayer2Username;
        // this.socketService.socket.emit('sendingMessage', {
        //     msg: this.newMessage,
        //     idGame: this.idOfTheGame,
        //     username: currentPlayer,
        //     messageSentTime: Date.now(),
        //     sentByPlayer1: this.isPlayer1,
        // });
        this.chatService.sendMessage(this.chatService.isPlayer1, this.newMessage, this.idOfTheGame as string);
    }

    // isTextValid(newMessage: string) {
    //     newMessage = newMessage.replace(/\s/g, ''); // Replace all space in a string
    //     if (newMessage === '' || newMessage === ' ' || newMessage === null) {
    //         return false;
    //     }
    //     return true;
    // }

    sendSystemMessage(message: string) {
        // this.messages.push({
        //     text: message,
        //     username: 'System',
        //     sentBySystem: true,
        //     sentByPlayer1: false,
        //     sentByPlayer2: false,
        //     sentTime: Date.now(),
        // });
        // this.scrollToBottom();
        // this.newMessage = '';
        this.chatService.sendMessageFromSystem(
            {message: message, chat: this.chat, newMessage: this.newMessage},
            this.messages,            
        )
    }

    // scrollToBottom() {
    //     setTimeout(() => {
    //         this.chat.nativeElement.scrollTop = this.chat.nativeElement.scrollHeight;
    //     });
    // }
}
