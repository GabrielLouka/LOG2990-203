import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({
    providedIn: 'root',
})
export class SocketClientService {
    socket: Socket;
    serverAddress: string = 'http://localhost:3000';

    get isSocketAlive() {
        return this.socket && this.socket.connected;
    }

    get socketId() {
        return this.socket.id ? this.socket.id : '';
    }

    connect() {
        this.socket = io(this.serverAddress, { transports: ['websocket'], upgrade: false });
    }

    disconnect() {
        this.socket.disconnect();
    }

    getSocketId() {
        return this.socket.id;
    }

    on<T>(event: string, action: (data: T) => void): void {
        this.socket.on(event, action);
    }

    send<T>(event: string, data?: T): void {
        if (data) {
            this.socket.emit(event, data);
        } else {
            this.socket.emit(event);
        }
    }
}
