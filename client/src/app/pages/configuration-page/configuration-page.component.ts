/* eslint-disable no-unused-vars */
/* eslint-disable no-restricted-imports */
/* eslint-disable no-useless-escape */
/* eslint-disable prettier/prettier */
import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Games } from '../../interfaces/games';
@Component({
    selector: 'app-configuration-page',
    templateUrl: './configuration-page.component.html',
    styleUrls: ['./configuration-page.component.scss'],
})
export class ConfigurationPageComponent implements OnInit {
    title = 'Page de configuration';
    games:Games[] = [
        {
            description: 'Jeux 1',
            image: '.\assets\img\ProjectLogo.png',
            difficulty: 'Hard',
            classements: [
                { name: 'ibrahim', score: 19996 },
                { name: 'ibrahim', score: 19996 },
                { name: 'ibrahim', score: 19996 },
            ],
        },
        {
            description: 'Jeux 1',
            image: '.\assets\img\ProjectLogo.png',
            difficulty: 'Hard',
            classements: [
                { name: 'ibrahim', score: 19996 },
                { name: 'ibrahim', score: 19996 },
                { name: 'ibrahim', score: 19996 },
            ],
        },
        {
            description: 'Jeux 1',
            image: '.\assets\img\ProjectLogo.png',
            difficulty: 'Hard',
            classements: [
                { name: 'ibrahim', score: 19996 },
                { name: 'ibrahim', score: 19996 },
                { name: 'ibrahim', score: 19996 },
            ],
        },
        {
            description: 'Jeux 1',
            image: '.\assets\img\ProjectLogo.png',
            difficulty: 'Hard',
            classements: [
                { name: 'ibrahim', score: 19996 },
                { name: 'ibrahim', score: 19996 },
                { name: 'ibrahim', score: 19996 },
            ],
        },
    ];
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
