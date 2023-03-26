import { ElementRef, Injectable } from '@angular/core';
import { ChatComponent } from '@app/components/chat/chat.component';
import { MatchmakingService } from '@app/services/matchmaking-service/matchmaking.service';
import { SocketClientService } from '@app/services/socket-client-service/socket-client.service';
import { SYSTEM_MESSAGE } from '@common/utils/env';
import { ReplayModeService } from '../replay-mode-service/replay-mode.service';

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
        return this.matchmakingService.is1vs1Mode;
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

    sendMessageFromSystem(textToSend: string, newMessage: string, chatComponent: ChatComponent) {
        const msg = {
            text: textToSend,
            username: SYSTEM_MESSAGE,
            sentBySystem: true,
            sentByPlayer1: false,
            sentByPlayer2: false,
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
            sentByPlayer2: boolean;
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
        return !(newMessage === '' || newMessage === ' ' || newMessage === null);
    }
}
