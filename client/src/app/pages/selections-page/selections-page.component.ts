import { Component } from '@angular/core';

@Component({
    selector: 'app-selections-page',
    templateUrl: './selections-page.component.html',
    styleUrls: ['./selections-page.component.scss'],
})
export class SelectionsPageComponent {
    title = 'Selection Page';

    games = ['Game 1', 'Game 2', 'Game 3', 'Game 4'];
}
