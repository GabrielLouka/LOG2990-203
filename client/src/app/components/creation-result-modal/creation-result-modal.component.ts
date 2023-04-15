import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SpinnerComponent } from '@app/components/spinner/spinner.component';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { EntireGameUploadForm } from '@common/interfaces/entire.game.upload.form';
import { ImageUploadResult } from '@common/interfaces/image.upload.result';
import { MAX_NBR_OF_DIFFERENCES, MIN_NBR_OF_DIFFERENCES } from '@common/utils/env';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-creation-result-modal',
    templateUrl: './creation-result-modal.component.html',
    styleUrls: ['./creation-result-modal.component.scss'],
})
export class CreationResultModalComponent {
    static readonly maxNumberOfDifferences: number = MAX_NBR_OF_DIFFERENCES;
    static readonly minNumberOfDifferences: number = MIN_NBR_OF_DIFFERENCES;

    @Input() totalDifferences: number;
    @Input() isEasy: boolean;

    @ViewChild('bgModal') modal!: ElementRef;
    @ViewChild('imagePreview') imagePreview!: ElementRef;
    @ViewChild('gameNameForm') gameNameForm!: ElementRef;
    @ViewChild('errorPopupText') errorPopupText!: ElementRef;
    @ViewChild('spinner') spinnerComponent!: SpinnerComponent;

    gameName: string = '';

    debugDisplayMessage: BehaviorSubject<string> = new BehaviorSubject<string>('');
    formToSendAfterServerConfirmation: EntireGameUploadForm;

    titleRegistration = new FormGroup({
        title: new FormControl('', Validators.compose([Validators.required, Validators.pattern('^[-a-zA-Z0-9-()]{3,15}(\\s+[-a-zA-Z0-9-()]+)*$')])),
    });

    constructor(private readonly communicationService: CommunicationService, private readonly router: Router) {}

    toggleElementVisibility(element: ElementRef, isVisible: boolean) {
        element.nativeElement.style.display = isVisible ? 'flex' : 'none';
    }

    showPopUp() {
        this.toggleElementVisibility(this.gameNameForm, false);
        this.toggleElementVisibility(this.errorPopupText, false);
        this.errorPopupText.nativeElement.style.color = 'red';
        this.modal.nativeElement.style.display = 'flex';
        this.spinnerComponent.showSpinner();
    }

    closePopUp() {
        this.modal.nativeElement.style.display = 'none';
    }

    showGameNameForm(totalDifferences: number, gameForm: EntireGameUploadForm) {
        this.spinnerComponent.hideSpinner();
        this.formToSendAfterServerConfirmation = gameForm;
        if (this.isNumberOfDifferencesValid(totalDifferences)) {
            this.toggleElementVisibility(this.gameNameForm, true);
        } else {
            this.toggleElementVisibility(this.errorPopupText, true);
        }
    }

    async sendGameNameToServer(): Promise<void> {
        const routeToSend = '/games/saveGame';

        this.toggleElementVisibility(this.gameNameForm, false);
        this.spinnerComponent.showSpinner();

        this.formToSendAfterServerConfirmation.gameName = this.gameName;

        this.debugDisplayMessage.next('Sending ' + this.gameName + 'to server (game id ' + this.formToSendAfterServerConfirmation.gameId + ')...');
        this.communicationService.post<EntireGameUploadForm>(this.formToSendAfterServerConfirmation, routeToSend).subscribe({
            next: (response) => {
                const responseString = ` ${response.status} -
        ${response.statusText} \n`;
                this.debugDisplayMessage.next(responseString);
                this.spinnerComponent.hideSpinner();
                this.closePopUp();
                this.router.navigate(['/home']);
            },
            error: (err: HttpErrorResponse) => {
                const responseString = `Server Error : ${err.message}`;
                const serverResult: ImageUploadResult = JSON.parse(err.error);
                this.debugDisplayMessage.next(responseString + '\n' + serverResult.message);
            },
        });
    }

    async updateImageDisplay(imgData: ArrayBuffer) {
        try {
            const canvas: HTMLCanvasElement = this.imagePreview.nativeElement;
            const ctx = canvas.getContext('2d');

            if (ctx) {
                const bitmap = await createImageBitmap(new Blob([imgData]));
                ctx.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height, 0, 0, canvas.width, canvas.height);
            }
        } catch (error) {
            // console.error('Error updating image display:', error);
        }
    }

    isNumberOfDifferencesValid(totalDifferences: number): boolean {
        return (
            totalDifferences >= CreationResultModalComponent.minNumberOfDifferences &&
            totalDifferences <= CreationResultModalComponent.maxNumberOfDifferences
        );
    }

    resetBackgroundCanvas() {
        const canvasSize: HTMLCanvasElement = this.imagePreview.nativeElement;

        if (canvasSize) {
            const context = canvasSize.getContext('2d');
            context?.clearRect(0, 0, canvasSize.width, canvasSize.height);
        }
    }
}
