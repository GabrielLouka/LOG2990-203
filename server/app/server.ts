/* eslint-disable no-console */
import { Application } from '@app/app';
import * as http from 'http';
import { AddressInfo } from 'net';
import { Service } from 'typedi';
import { DatabaseService } from './services/database.service';
import { GameStorageService } from './services/game-storage.service';
import { MatchManagerService } from './services/match-manager.service';
import { SocketManager } from './services/socket-manager.service';
const baseDix = 10;

@Service()
export class Server {
    private static readonly appPort: string | number | boolean = Server.normalizePort(process.env.PORT || '3000');
    private static readonly baseDix: number = baseDix;
    private server: http.Server;
    private socketManager: SocketManager;
    constructor(private application: Application, private databaseService: DatabaseService, public matchManagerService: MatchManagerService) {}

    private static normalizePort(val: number | string): number | string | boolean {
        const port: number = typeof val === 'string' ? parseInt(val, this.baseDix) : val;
        if (isNaN(port)) {
            return val;
        } else if (port >= 0) {
            return port;
        } else {
            return false;
        }
    }
    async init(): Promise<void> {
        this.application.app.set('port', Server.appPort);

        this.server = http.createServer(this.application.app);

        this.socketManager = new SocketManager(this.server, this.matchManagerService);
        this.socketManager.handleSockets();

        this.server.listen(Server.appPort);

        this.server.on('error', (error: NodeJS.ErrnoException) => this.onError(error));
        this.server.on('listening', () => this.onListening());

        try {
            await this.databaseService.start();
            this.application.gamesController.gameStorageService = new GameStorageService(this.databaseService);
            console.log('Database connection successful !');
        } catch {
            console.error('Database connection failed !');
        }
    }

    private onError(error: NodeJS.ErrnoException): void {
        if (error.syscall !== 'listen') {
            throw error;
        }
        const bind: string = typeof Server.appPort === 'string' ? 'Pipe ' + Server.appPort : 'Port ' + Server.appPort;
        switch (error.code) {
            case 'EACCES':
                console.error(`${bind} requires elevated privileges`);
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(`${bind} is already in use`);
                process.exit(1);
                break;
            default:
                throw error;
        }
    }

    private onListening(): void {
        const addr = this.server.address() as AddressInfo;
        const bind: string = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
        console.log(`Listening on ${bind}`);
    }
}
