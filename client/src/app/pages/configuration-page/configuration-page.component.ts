/* eslint-disable no-unused-vars */
/* eslint-disable no-restricted-imports */
/* eslint-disable no-useless-escape */
/* eslint-disable prettier/prettier */
import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Game } from '../../interfaces/games';

@Component({
    selector: 'app-configuration-page',
    templateUrl: './configuration-page.component.html',
    styleUrls: ['./configuration-page.component.scss'],
})

export class ConfigurationPageComponent implements OnInit {
    title = 'Page de configuration';
    games: Game[] = [
        {
            description: 'Jeux 1',
            image: '.\assets\img\ProjectLogo.png',
            difficulty: 'Hard',
            ranking: [
                { name: 'ibrahim', score: 19996 },
                { name: 'ibrahim', score: 19996 },
                { name: 'ibrahim', score: 19996 },
            ]
        },
        {
            description: 'Jeux 2',
            image: '.\assets\img\ProjectLogo.png',
            difficulty: 'Hard',
            ranking: [
                { name: 'ibrahim', score: 19996 },
                { name: 'ibrahim', score: 19996 },
                { name: 'ibrahim', score: 19996 },
            ]
        },
        {
            description: 'Jeux 3',
            image: '.\assets\img\ProjectLogo.png',
            difficulty: 'Hard',
            ranking: [
                { name: 'ibrahim', score: 19996 },
                { name: 'ibrahim', score: 19996 },
                { name: 'ibrahim', score: 19996 },
            ],
        },
        {
            description: 'Jeux 4',
            image: '.\assets\img\ProjectLogo.png',
            difficulty: 'Hard',
            ranking: [
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
