import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({
    providedIn: 'root',
})
export class SocketClientService {
    socket: Socket;
    serverAddress: string = 'http://ec2-35-183-125-86.ca-central-1.compute.amazonaws.com:3000/api';

    isSocketAlive() {
        return this.socket && this.socket.connected;
    }

    connect() {
        this.socket = io(this.serverAddress, { transports: ['websocket'], upgrade: false });
    }

    disconnect() {
        this.socket.disconnect();
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
