/* eslint-disable @typescript-eslint/no-magic-numbers */
import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SpinnerComponent } from '@app/components/spinner/spinner.component';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { EntireGameUploadForm } from '@common/entire.game.upload.form';
import { ImageUploadResult } from '@common/image.upload.result';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-creation-result-modal',
    templateUrl: './creation-result-modal.component.html',
    styleUrls: ['./creation-result-modal.component.scss'],
})
export class CreationResultModalComponent {
    static readonly maxNumberOfDifferences: number = 9;
    static readonly minNumberOfDifferences: number = 3;

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

        this.formToSendAfterServerConfirmation.gameName = this.gameName;

        this.debugDisplayMessage.next('Sending ' + this.gameName + 'to server (game id ' + this.formToSendAfterServerConfirmation.gameId + ')...');
        this.communicationService.post<EntireGameUploadForm>(this.formToSendAfterServerConfirmation, routeToSend).subscribe({
            next: (response) => {
                const responseString = ` ${response.status} -
        ${response.statusText} \n`;
                this.debugDisplayMessage.next(responseString);
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

    updateImageDisplay(imgData: ArrayBuffer) {
        const canvas: HTMLCanvasElement = this.imagePreview.nativeElement;
        const ctx = canvas.getContext('2d');
        if (ctx !== null) {
            const img = new Image();
            img.src = URL.createObjectURL(new Blob([imgData]));
            img.onload = () => {
                ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
            };
        }
    }

    isNumberOfDifferencesValid(totalDifferences: number): boolean {
        return (
            totalDifferences >= CreationResultModalComponent.minNumberOfDifferences &&
            totalDifferences <= CreationResultModalComponent.maxNumberOfDifferences
        );
    }
}
