import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    userName: string = '';

    registerUser(pseudo: string) {
        this.userName = pseudo;
    }

    registerUserName() {
        return this.userName;
    }
}
