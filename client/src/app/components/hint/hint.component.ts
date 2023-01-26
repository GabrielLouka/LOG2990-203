import { Component } from '@angular/core';

@Component({
    selector: 'app-hint',
    templateUrl: './hint.component.html',
    styleUrls: ['./hint.component.scss'],
})
export class HintComponent {
    maxGivenHints = 3;

    giveHint() {
        this.decrement();
    }

    decrement() {
        if (this.maxGivenHints !== 0) {
            this.maxGivenHints--;
        } else {
            window.alert('Vous avez utilisé vos indices !');
        }
    }
}
