import { Injectable } from '@angular/core';
@Injectable({
    providedIn: 'root',
})
export class RegistrationService {
    registeredUsernames: string[];

    constructor() {
        this.registeredUsernames = [];
    }

    hasIdenticalUsername(usernameThatWantsToJoin: string): boolean {
        return this.registeredUsernames.includes(usernameThatWantsToJoin);
    }

    handleIdenticalUsername(usernameThatWantsToJoin: string): string {
        const username = this.hasIdenticalUsername(usernameThatWantsToJoin) ? (usernameThatWantsToJoin += '#2') : usernameThatWantsToJoin;
        this.updateRegisteredUsername(usernameThatWantsToJoin);
        return username;
    }

    updateRegisteredUsername(usernameThatWantsToJoin: string) {
        this.registeredUsernames.push(usernameThatWantsToJoin);
    }
}
