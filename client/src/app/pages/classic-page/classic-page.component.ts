import { Component } from '@angular/core';

@Component({
    selector: 'app-classic-page',
    templateUrl: './classic-page.component.html',
    styleUrls: ['./classic-page.component.scss'],
})
export class ClassicPageComponent {
    title = 'JEUX CLASSIQUE';
    timeInSeconds = 3000;
}
