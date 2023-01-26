import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-registration-page',
    templateUrl: './registration-page.component.html',
    styleUrls: ['./registration-page.component.scss'],
})
export class RegistrationPageComponent {
    title = 'Register Page';

    registrationForm = new FormGroup({
        pseudo: new FormControl('', Validators.compose([Validators.required, Validators.pattern('^[a-zA-Z0-9_]{3,}$')])),
    });
}
