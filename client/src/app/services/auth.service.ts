import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    userName: string = '';

    registerUser(username: string) {
        this.userName = username;
    }

    registeredUserName() {
        return this.userName;
    }
}
