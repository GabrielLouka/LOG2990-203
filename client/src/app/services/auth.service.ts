import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private userName: string = '';

    registerUser(username: string) {
        this.userName = username;
    }

    getUserName() {
        return this.userName;
    }
}
