import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { CommunicationService } from '@app/services/communication.service';
import { Message } from '@common/message';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-server-debug-page',
    templateUrl: './server-debug-page.component.html',
    styleUrls: ['./server-debug-page.component.scss'],
})
export class ServerDebugPageComponent {
    debugDisplayMessage: BehaviorSubject<string> = new BehaviorSubject<string>('');

    constructor(private readonly communicationService: CommunicationService) {}

    sendImageToServer(): void {
        const routeToSend = '/example/send-image';
        const inputValue = (<HTMLInputElement>document.getElementById('browseButton')).value;

        const contentToSend: Message = {
            title: 'Sending a new image to compute',
            body: inputValue,
        };

        this.communicationService.postRequest(contentToSend, routeToSend).subscribe({
            next: (response) => {
                const responseString = `Success : ${response.status} - ${response.statusText}`;
                this.debugDisplayMessage.next(responseString);
            },
            error: (err: HttpErrorResponse) => {
                const responseString = `Server Error : ${err.message}`;
                this.debugDisplayMessage.next(responseString);
            },
        });
    }
}
