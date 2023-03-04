import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-found-hints-counter',
    templateUrl: './found-hints-counter.component.html',
    styleUrls: ['./found-hints-counter.component.scss'],
})
export class FoundHintsCounterComponent {
    @Input() differencesNbr: number;
    @Input() differencesFound: number;
    @Input() username: string;
    // username = this.auth.registeredUserName();
    constructor() {}
}
