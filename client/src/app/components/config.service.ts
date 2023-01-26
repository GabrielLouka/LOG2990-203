import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class ConfigService {
    hintsCount = 3;
    // TODO il faudra choisir les indices à donner selon le degré de difficulté
    // hints: Hints[] = [];

    decrementHints() {
        this.hintsCount--;
    }
}
