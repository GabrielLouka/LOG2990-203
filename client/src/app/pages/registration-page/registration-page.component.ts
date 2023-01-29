import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '@app/services/auth.service';

@Component({
    selector: 'app-registration-page',
    templateUrl: './registration-page.component.html',
    styleUrls: ['./registration-page.component.scss'],
})
export class RegistrationPageComponent {
    title = 'Register Page';
    btnType = 'Retour';

    registrationForm = new FormGroup({
        pseudo: new FormControl('', Validators.required),
    });

    constructor(private auth: AuthService) {}

    registerUser() {
        this.auth.registerUser(this.registrationForm.value.pseudo);
    }
}
