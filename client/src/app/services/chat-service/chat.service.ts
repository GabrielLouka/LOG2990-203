import { ElementRef, Injectable } from '@angular/core';
import { ChatMessage } from '@app/interfaces/chat-message';
import { MatchmakingService } from '@app/services/matchmaking-service/matchmaking.service';
import { SocketClientService } from '@app/services/socket-client-service/socket-client.service';
import { SYSTEM_NAME } from '@common/utils/env';

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    constructor(private readonly socketService: SocketClientService, private matchmakingService: MatchmakingService) {}

    get isPlayer1() {
        return this.socketService.socketId === this.matchmakingService.player1Id;
    }

    get isMode1vs1() {
        return this.matchmakingService.isOneVersusOne;
    }

    sendMessage(isPlayer1: boolean, newMessage: string) {
        const currentPlayer = isPlayer1 ? this.matchmakingService.player1Username : this.matchmakingService.player2Username;
        if (this.isTextValid(newMessage)) {
            this.socketService.socket.emit('sendingMessage', {
                message: newMessage,
                username: currentPlayer,
                sentByPlayer1: isPlayer1,
            });
        }
    }

    sendRecordBreakingMessage(
        chatELements: { message: string; chat: ElementRef; newMessage: string; recordPlayerUsername: string },
        messages: ChatMessage[],
    ) {
        messages.push({
            text: chatELements.message,
            username: chatELements.recordPlayerUsername,
            sentBySystem: false,
            sentByPlayer1: false,
            sentUpdatedScore: true,
            sentTime: Date.now(),
        });
        this.scrollToBottom(chatELements.chat);
        chatELements.newMessage = this.clearMessage();
    }

    sendMessageFromSystem(chatELements: { message: string; chat: ElementRef; newMessage: string }, messages: ChatMessage[]) {
        messages.push({
            text: chatELements.message,
            username: SYSTEM_NAME,
            sentBySystem: true,
            sentByPlayer1: false,
            sentUpdatedScore: false,
            sentTime: Date.now(),
        });
        this.scrollToBottom(chatELements.chat);
        chatELements.newMessage = this.clearMessage();
    }

    clearMessage() {
        return '';
    }

    scrollToBottom(chat: ElementRef) {
        setTimeout(() => {
            chat.nativeElement.scrollTop = chat.nativeElement.scrollHeight;
        });
    }

    isTextValid(newMessage: string) {
        newMessage = newMessage.replace(/\s/g, '');
        return !(newMessage === '' || newMessage === ' ' || !newMessage);
    }
}
