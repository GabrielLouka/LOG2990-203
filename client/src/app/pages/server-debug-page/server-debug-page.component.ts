import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { CommunicationService } from '@app/services/communication.service';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-server-debug-page',
    templateUrl: './server-debug-page.component.html',
    styleUrls: ['./server-debug-page.component.scss'],
})
export class ServerDebugPageComponent {
    debugDisplayMessage: BehaviorSubject<string> = new BehaviorSubject<string>('');

    constructor(private readonly communicationService: CommunicationService) {}

    async sendImageToServer(): Promise<void> {
        const routeToSend = '/image_processing/send-image';
        const inputValue = (document.getElementById('browseButton') as HTMLInputElement).files?.[0];

        if (inputValue !== undefined) {
            const buffer = await inputValue.arrayBuffer();

            // convert buffer to int array
            const byteArray: number[] = Array.from(new Uint8Array(buffer));

            // eslint-disable-next-line no-console
            console.log('Sending image to server' + byteArray);

            this.communicationService.post<number[]>(byteArray, routeToSend).subscribe({
                next: (response) => {
                    const responseString = `Success : ${response.status} - 
                    ${response.statusText} \n`;
                    this.updateImageDisplay(this.convertToBuffer(JSON.parse(response.body as string)));
                    this.debugDisplayMessage.next(responseString);
                },
                error: (err: HttpErrorResponse) => {
                    const responseString = `Server Error : ${err.message}`;
                    this.debugDisplayMessage.next(responseString);
                },
            });
        }
    }

    // Convert number[] to ArrayBuffer
    convertToBuffer(byteArray: number[]): ArrayBuffer {
        const buffer = new ArrayBuffer(byteArray.length);
        const view = new Uint8Array(buffer);
        for (let i = 0; i < byteArray.length; i++) {
            view[i] = byteArray[i];
        }
        return buffer;
    }

    updateImageDisplay(imgData: ArrayBuffer) {
        const imagePreview = document.getElementById('image-preview') as HTMLImageElement;
        if (imagePreview !== null) imagePreview.src = URL.createObjectURL(new Blob([imgData]));
    }
}
