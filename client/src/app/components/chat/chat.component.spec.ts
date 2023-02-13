import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatComponent } from './chat.component';

describe('ChatComponent', () => {
    let component: ChatComponent;
    let fixture: ComponentFixture<ChatComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ChatComponent],
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
        component.sendMessage(1);

        expect(component.messages.length).toBe(0);
    });

    it('should add a message to the chat (player)', () => {
        component.newMessage = 'test';
        component.sendMessage(1);

        expect(component.messages.length).toBe(1);
    });

    it('should not add a message to the chat (system)', () => {
        component.newMessage = 'test';
        component.addMessage('test');

        expect(component.messages.length).toBe(1);
    });
});
