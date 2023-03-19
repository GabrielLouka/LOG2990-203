import { ElementRef, Injectable } from '@angular/core';
import { SYSTEM_MESSAGE } from '@common/utils/env';
import { MatchmakingService } from '../matchmaking-service/matchmaking.service';
import { SocketClientService } from '../socket-client-service/socket-client.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private readonly socketService: SocketClientService, private matchmakingService: MatchmakingService) { }

  get isPlayer1(){
    return this.socketService.socketId === this.matchmakingService.player1SocketId;
  }

  get isMode1vs1(){
    return this.matchmakingService.is1vs1Mode;
  }

  sendMessage(isPlayer1: boolean, newMessage: string, idOfTheGame: string | undefined){
    const currentPlayer = isPlayer1
            ? this.matchmakingService.currentMatchPlayer1Username
            : this.matchmakingService.currentMatchPlayer2Username;
        if (!this.isTextNotValid(newMessage)){
          this.socketService.socket.emit('sendingMessage', {
            msg: newMessage,
            idGame: idOfTheGame,
            username: currentPlayer,
            messageSentTime: Date.now(),
            sentByPlayer1: isPlayer1
        });
        }
  }

  sendMessageFromSystem(chatELements : {message: string, chat: ElementRef, newMessage: string}, messages: {
        text: string;
        username: string;
        sentBySystem: boolean;
        sentByPlayer1: boolean;
        sentByPlayer2: boolean;
        sentTime: number;
    }[]){      
      messages.push(
        {
          text: chatELements.message,
          username: SYSTEM_MESSAGE,
          sentBySystem: true,
          sentByPlayer1: false,
          sentByPlayer2: false,
          sentTime: Date.now()
        }
      )      
        this.scrollToBottom(chatELements.chat);
        chatELements.newMessage = this.clearMessage();
  }

  clearMessage(){
    return '';
  }

  scrollToBottom(chat: ElementRef){
    setTimeout(() => {
      chat.nativeElement.scrollTop = chat.nativeElement.scrollHeight;
    })
  }

  isTextNotValid(newMessage: string) {
      newMessage = newMessage.replace(/\s/g, '');
      return newMessage === '' || newMessage === ' ' || newMessage === null;
  }

}
