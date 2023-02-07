import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    userName: unknown = '';
    // private registerUrl = 'http://localhost:3000/api/register';
    // constructor(private http: HttpClient) {}

    registerUser(pseudo: unknown) {
        this.userName = pseudo;
        // return this.http.post<unknown>(this.registerUrl, pseudo);
    }

    registerUserName() {
        return this.userName;
    }
}
