import { Component, ElementRef, Input, ViewChild } from '@angular/core';

@Component({
    selector: 'app-pop-up',
    templateUrl: './pop-up.component.html',
    styleUrls: ['./pop-up.component.scss'],
})
export class PopUpComponent {
    @Input() title: string = '';
    @Input() message: string = '';
    @Input() option1: string = 'OK';
    @Input() option2: string = '';
    @ViewChild('bgModal') modal!: ElementRef;
    displayPopUp: boolean = true;

    showPopUp() {
        this.modal.nativeElement.style.display = 'flex';
    }

    hidePopUp() {
        this.displayPopUp = false;
    }
}
