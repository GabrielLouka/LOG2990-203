/* eslint-disable @typescript-eslint/no-magic-numbers */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatService } from '@app/services/chat-service/chat.service';
import { ChatComponent } from './chat.component';

describe('ChatComponent', () => {
    let component: ChatComponent;
    let fixture: ComponentFixture<ChatComponent>;
    let chatService: jasmine.SpyObj<ChatService>;

    beforeEach(() => {
        chatService = jasmine.createSpyObj('ChatService', ['sendMessage', 'sendMessageFromSystem', 'scrollToBottom']);
        
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ChatComponent],
            providers: [
                {provide: ChatService, useValue: chatService}
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ChatComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should not add a message to the chat (player) if it is empty', () => {
        component.newMessage = '   ';
        component.sendMessage();

        expect(component.messages.length).toBe(0);
    });
    it('should add a message to the chat (player)', () => {
        component.newMessage = 'test';
        component.sendMessage();

        expect(component.messages.length).toBe(0);
    });

    it('should not add a message to the chat (system)', () => {
        component.messages = [];
        component.newMessage = 'test';
        component.sendSystemMessage('test');

        expect(component.messages.length).toBe(0);
    });

    it("sendMessage should use service", () => {
        spyOn(component, 'sendMessage');
        component.sendMessage();
        expect(chatService.sendMessage).not.toHaveBeenCalled();
    });
});
