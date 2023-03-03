import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private userName: string = '';

    registerUser(username: string) {
        this.userName = username;
    }

    registeredUserName() {
        return this.userName;
    }

    isIdentical(usernamePlayer1: string, usernamePlayer2: string) {
        return usernamePlayer1 === usernamePlayer2;
    }

    userNamesCheck(usernamePlayer1: string, usernamePlayer2: string) {
        if (this.isIdentical(usernamePlayer1, usernamePlayer2)) {
            usernamePlayer1 += '#1';
            usernamePlayer2 += '#2';
        }
        return [usernamePlayer1, usernamePlayer2];
    }
}
