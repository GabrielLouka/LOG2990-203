import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-back-button',
    templateUrl: './back-button.component.html',
    styleUrls: ['./back-button.component.scss'],
})
export class BackButtonComponent {
    @Input() btnType: string = '';

    goBack() {
        window.history.back();
    }
}
