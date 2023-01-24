import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
@Component({
    selector: 'app-configuration-page',
    templateUrl: './configuration-page.component.html',
    styleUrls: ['./configuration-page.component.scss'],
})
export class ConfigurationPageComponent implements OnInit {
    title = 'Page de configuration';
    constructor(private location: Location) {}

    ngOnInit(): void {}

    over() {
        const subBox = document.getElementById('sub-box');
        if (subBox) {
            subBox.className = 'game-buttons';
        }
    }
    previousPage() {
        this.location.back();
    }
}
