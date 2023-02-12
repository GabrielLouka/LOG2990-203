/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { SocketTestHelper } from './socket-test-helper';
describe('SocketTestHelper', () => {
    let socketTestHelper: SocketTestHelper;

    beforeEach(() => {
        socketTestHelper=new SocketTestHelper();
    });
    afterEach(()=>{
        socketTestHelper.disconnect();

    });

    it('should be created', () => {
        expect(socketTestHelper).toBeTruthy();
    });
    it('should register a callback for a specific event', () => {
        const callback = ((params: any) => {}) as any;
        socketTestHelper.on('event1', callback);
        socketTestHelper.on('event1', callback);
        expect(socketTestHelper['callbacks'].has('event1')).toBeTruthy();
        expect(socketTestHelper['callbacks'].get('event1')).toContain(callback);
    });
    
    it('should invoke all callbacks registered for a specific event', () => {
        const callback1 = jasmine.createSpy('callback1');
        const callback2 = jasmine.createSpy('callback2');
        socketTestHelper.on('event2', callback1);
        socketTestHelper.on('event2', callback2);
    
        socketTestHelper.peerSideEmit('event2');
    
        expect(callback1).toHaveBeenCalled();
        expect(callback2).toHaveBeenCalled();
    });
    it('should not invoke callback registered for a specific event', () => {
        const result=socketTestHelper.peerSideEmit('event2');
        expect(result).toEqual(undefined);   
        
    });
    it('should emit the socket', () => {
        const result=socketTestHelper.emit('event2');
        expect(result).toEqual(undefined);   
        
    });
    
   
});
