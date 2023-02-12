import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    userName: unknown = '';

    registerUser(pseudo: unknown) {
        this.userName = pseudo;
    }

    registerUserName() {
        return this.userName;
    }
}
