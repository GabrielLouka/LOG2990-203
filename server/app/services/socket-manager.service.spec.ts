// /* eslint-disable no-unused-vars */
// import { Server } from 'app/server';
// import { Container } from 'typedi';
// import { SocketManager } from './socket-manager.service';

// describe('SocketManager service', () => {
//     let socketService: SocketManager;
//     let server: Server;
//     // let clientSocket: Socket;
//     // const urlString = 'http://localhost:4200';

//     beforeEach(async () => {
//         server = Container.get(Server);
//         server.init();
//         socketService = server['SocketManager'];
//         // clientSocket = ioClient(urlString);
//     });

//     // it("SocketManager constructor should include http.server", () => {
//     //     const sioInstance = new io.Server(httpInstance, { cors: { origin: '*', methods: ['GET', 'POST'] } });
//     //     expect(socketService['sio']).to.equal(sioInstance);
//     //     expect(socketService.matchingDifferencesService).to.equal(matchingService);

//     // });

//     // it('should broadcast to all sockets when emiting time', () => {
//     //     const spy = sinon.spy(socketService['sio'].sockets, 'emit');
//     //     socketService['emitTime']();
//     //     assert(spy.called);
//     // });

//     // it('should call emitTime on socket configuration', (done) => {
//     //     const spy = sinon.spy(socketService, <unknown>'emitTime');
//     //     setTimeout(() => {
//     //         assert(spy.called);
//     //         done();
//     //     }, RESPONSE_DELAY * 5);
//     // });
// });
