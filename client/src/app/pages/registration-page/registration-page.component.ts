import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '@app/services/auth.service';

@Component({
    selector: 'app-registration-page',
    templateUrl: './registration-page.component.html',
    styleUrls: ['./registration-page.component.scss'],
})
export class RegistrationPageComponent implements OnInit {
    title = 'Register Page';
    username: string | null | undefined;
    id: string | null;

    registrationForm = new FormGroup({
        username: new FormControl('', Validators.compose([Validators.required, Validators.pattern('^[a-zA-Z0-9]{3,15}$')])),
    });

    constructor(private auth: AuthService, private route: ActivatedRoute) {}

    ngOnInit(): void {
        this.id = this.route.snapshot.paramMap.get('id');
    }
    registerUser() {
        this.auth.registerUser(this.registrationForm.value.username);
        this.username = this.registrationForm.value.username;
    }

    getUser() {
        return this.auth.registerUserName();
    }
}
