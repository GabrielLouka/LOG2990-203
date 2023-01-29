import { Component } from '@angular/core';
import { AuthService } from '@app/services/auth.service';

@Component({
    selector: 'app-found-hints-counter',
    templateUrl: './found-hints-counter.component.html',
    styleUrls: ['./found-hints-counter.component.scss'],
})
export class FoundHintsCounterComponent {
    pseudo = this.auth.registerUserName();
    constructor(private auth: AuthService) {}
}
