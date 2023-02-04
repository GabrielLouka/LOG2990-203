import { Injectable } from '@angular/core';
import { CommunicationService } from './communication.service';
import { ImageUploadResult } from '@common/image.upload.result';

@Injectable({
    providedIn: 'root',
})
export class UploadImageService {
    constructor(private readonly communicationService: CommunicationService) {}



    async getGameImageFromServer(): Promise<void> {
        const routeToSend = '/games/saveGame';
       
        this.communicationService.get<EntireGameUploadForm>(this.formToSendAfterServerConfirmation, routeToSend).subscribe({
            next: (response) => {
                const responseString = ` ${response.status} - 
            ${response.statusText} \n`;
                this.debugDisplayMessage.next(responseString);
                this.closePopUp();
            },
            error: (err: HttpErrorResponse) => {
                const responseString = `Server Error : ${err.message}`;
                const serverResult: ImageUploadResult = JSON.parse(err.error);
                this.debugDisplayMessage.next(responseString + '\n' + serverResult.message);
            },
        });
    }
}
