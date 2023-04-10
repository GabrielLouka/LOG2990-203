import { ElementRef, Injectable } from '@angular/core';
import { ChatComponent } from '@app/components/chat/chat.component';
import { ChatMessage } from '@app/interfaces/chat-message';
import { MatchmakingService } from '@app/services/matchmaking-service/matchmaking.service';
import { ReplayModeService } from '@app/services/replay-mode-service/replay-mode.service';
import { SocketClientService } from '@app/services/socket-client-service/socket-client.service';
import { RankingData } from '@common/interfaces/ranking.data';
import { SYSTEM_NAME } from '@common/utils/env';

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    constructor(
        private readonly socketService: SocketClientService,
        private matchmakingService: MatchmakingService,
        private replayModeService: ReplayModeService,
    ) {}

    get isPlayer1() {
        return this.socketService.socketId === this.matchmakingService.player1Id;
    }

    get isMode1vs1() {
        return this.matchmakingService.isOneVersusOne || this.matchmakingService.isCoopMode;
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

    sendRecordBreakingMessage(chatELements: { rankingData: RankingData; chat: ElementRef; newMessage: string }, messages: ChatMessage[]) {
        const message = `${chatELements.rankingData.username} obtient la ${chatELements.rankingData.position} 
        place dans les meilleurs temps du jeu ${chatELements.rankingData.gameName} en ${chatELements.rankingData.matchType}`;

        messages.push({
            text: message,
            username: '',
            sentBySystem: false,
            sentByPlayer1: false,
            sentUpdatedScore: true,
            sentTime: Date.now(),
        });
        this.scrollToBottom(chatELements.chat);
        chatELements.newMessage = this.clearMessage();
    }

    sendMessageFromSystem(textToSend: string, newMessage: string, chatComponent: ChatComponent) {
        const msg = {
            text: textToSend,
            username: SYSTEM_NAME,
            sentBySystem: true,
            sentByPlayer1: false,
            sentUpdatedScore: false,
            sentTime: Date.now(),
        };
        this.pushMessage(msg, chatComponent);
    }

    pushMessage(
        messageToPush: {
            text: string;
            username: string;
            sentBySystem: boolean;
            sentByPlayer1: boolean;
            sentUpdatedScore: boolean;
            sentTime: number;
        },
        chatComponent: ChatComponent,
    ) {
        const pushMethod = () => {
            chatComponent.messages.push(messageToPush);
            this.scrollToBottom(chatComponent.chat);
            chatComponent.newMessage = this.clearMessage();
        };

        pushMethod();
        this.replayModeService.addMethodToReplay(pushMethod);
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
