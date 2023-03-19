import { ElementRef, Injectable } from '@angular/core';
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
        this.socketService.socket.emit('sendingMessage', {
            msg: newMessage,
            idGame: idOfTheGame,
            username: currentPlayer,
            messageSentTime: Date.now(),
            sentByPlayer1: isPlayer1
        });
  }

  sendMessageFromSystem(chatELements : {message: string, chat: ElementRef, newMessage: string}, messages: {
        text: string;
        username: string;
        sentBySystem: boolean;
        sentByPlayer1: boolean;
        sentByPlayer2: boolean;
        sentTime: number;
    }[]){
      if(this.isTextValid(chatELements.message)){
        messages.push(
          {
            text: chatELements.message,
            username: 'System', //add as constant
            sentBySystem: true,
            sentByPlayer1: false,
            sentByPlayer2: false,
            sentTime: Date.now()
          }
        )
      }
        this.scrollToBottom(chatELements.chat);
        chatELements.newMessage = this.clearMessage();
  }

  clearMessage(){
    return ''
  }

  scrollToBottom(chat: ElementRef){
    setTimeout(() => {
      chat.nativeElement.scrollTop = chat.nativeElement.scrollHeight;
    })
  }

  isTextValid(newMessage: string) {
        newMessage = newMessage.replace(/\s/g, ''); // Replace all space in a string
        if (newMessage === '' || newMessage === ' ' || newMessage === null) {
            return false;
        }
        return true;
  }



}
