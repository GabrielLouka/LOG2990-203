/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable no-unused-vars */
/* eslint-disable no-restricted-imports */
/* eslint-disable no-useless-escape */
/* eslint-disable prettier/prettier */
import { Component } from '@angular/core';
import { Ranking } from '@common/ranking';
import { Game } from '../../interfaces/games';

@Component({
    selector: 'app-configuration-page',
    templateUrl: './configuration-page.component.html',
    styleUrls: ['./configuration-page.component.scss'],
})
export class ConfigurationPageComponent {
    btnType = 'Retour';
    title = 'Page de configuration';
    playable = false;

    resetClassement: Ranking[] = [
        { name: 'PlayerA', score: "10:00" },
        { name: 'PlayerB', score: "10:00" },
        { name: 'PlayerC', score: "10:00" }
    ];
    currentIndex = 0;
    games: Game[][] = [[
        {
            description: 'Glouton',
            image: '.\\assets\\img\\game-icon.png',
            difficulty: 'DIFFICILE',
            ranking: [
                [
                    { name: 'gabriel', score: '05:30' },
                    { name: 'gabriel', score: '05:30' },
                    { name: 'gabriel', score: '05:30' },
                ],
                [
                    { name: 'gabriel', score: '05:30' },
                    { name: 'gabriel', score: '05:30' },
                    { name: 'gabriel', score: '05:30' },
                ],
            ],
        },
        {
            description: 'Hommes de Cro-Magnon',
            image: '.\\assets\\img\\game-icon.png',
            difficulty: 'FACILE',
            ranking: [
                [
                    { name: 'gabriel', score: '05:30' },
                    { name: 'gabriel', score: '05:30' },
                    { name: 'gabriel', score: '05:30' },
                ],
                [
                    { name: 'gabriel', score: '05:30' },
                    { name: 'gabriel', score: '05:30' },
                    { name: 'gabriel', score: '05:30' },
                ],
            ],
        },
        {
            description: 'Bagnoles',
            image: '.\\assets\\img\\game-icon.png',
            difficulty: 'FACILE',
            ranking: [
                [
                    { name: 'gabriel', score: '05:30' },
                    { name: 'gabriel', score: '05:30' },
                    { name: 'gabriel', score: '05:30' },
                ],
                [
                    { name: 'gabriel', score: '05:30' },
                    { name: 'gabriel', score: '05:30' },
                    { name: 'gabriel', score: '05:30' },
                ],
            ],
        },
        {
            description: 'Playa',
            image: '.\\assets\\img\\game-icon.png',
            difficulty: 'DIFFICILE',
            ranking: [
                [
                    { name: 'gabriel', score: '05:30' },
                    { name: 'gabriel', score: '05:30' },
                    { name: 'gabriel', score: '05:30' },
                ],
                [
                    { name: 'gabriel', score: '05:30' },
                    { name: 'gabriel', score: '05:30' },
                    { name: 'gabriel', score: '05:30' },
                ],
            ],
        },
    ],
    [
        {
            description: 'Glouton',
            image: '.\\assets\\img\\game-icon.png',
            difficulty: 'DIFFICILE',
            ranking: [
                [
                    { name: 'ibrahim', score: '19996' },
                    { name: 'ibrahim', score: '19996' },
                    { name: 'ibrahim', score: '19996' },
                ],
                [
                    { name: 'ibrahim', score: '19996' },
                    { name: 'ibrahim', score: '19996' },
                    { name: 'ibrahim', score: '19996' },
                ],
            ],
        },
        {
            description: 'Hommes de Cro-Magnon',
            image: '.\\assets\\img\\game-icon.png',
            difficulty: 'FACILE',
            ranking: [
                [
                    { name: 'ibrahim', score: '19996' },
                    { name: 'ibrahim', score: '19996' },
                    { name: 'ibrahim', score: '19996' },
                ],
                [
                    { name: 'ibrahim', score: '19996' },
                    { name: 'ibrahim', score: '19996' },
                    { name: 'ibrahim', score: '19996' },
                ],
            ],
        },
        {
            description: 'Bagnoles',
            image: '.\\assets\\img\\game-icon.png',
            difficulty: 'MOYEN',
            ranking: [
                [
                    { name: 'ibrahim', score: '19996' },
                    { name: 'ibrahim', score: '19996' },
                    { name: 'ibrahim', score: '19996' },
                ],
                [
                    { name: 'ibrahim', score: '19996' },
                    { name: 'ibrahim', score: '19996' },
                    { name: 'ibrahim', score: '19996' },
                ],
            ],
        },
        {
            description: 'Playa',
            image: '.\\assets\\img\\game-icon.png',
            difficulty: 'MOYEN',
            ranking: [
                [
                    { name: 'ibrahim', score: '19996' },
                    { name: 'ibrahim', score: '19996' },
                    { name: 'ibrahim', score: '19996' },
                ],
                [
                    { name: 'ibrahim', score: '19996' },
                    { name: 'ibrahim', score: '19996' },
                    { name: 'ibrahim', score: '19996' },
                ],
            ],
        },
    ]
    ];

    goToNextSlide() {
        const isLastPage = this.currentIndex === this.games.length - 1;
        const newIndex = isLastPage ? this.currentIndex : this.currentIndex + 1;
        this.currentIndex = newIndex;
    }
    goToPreviousSlide() {
        const isFirstPage = this.currentIndex === 0;
        const newIndex = isFirstPage ? this.currentIndex : this.currentIndex - 1;
        this.currentIndex = newIndex;
    }

    // resetButton() {
    //     if (confirm('Are you sure you want to reset all the games')) {
    //         for (let i = 0; i < this.games.length; i++) {
    //             for (let j = 0; j < this.games[i].ranking.length; j++) {
    //                 this.games[i].ranking[j] = this.resetClassement;
    //             }
    //         }
    //     }
    // }
    // deleteButton() {
    //     if (confirm('Are you sure you want to delete all the games')) {
    //         const divContainer: HTMLCollectionOf<Element> = document.getElementsByClassName('container') as HTMLCollectionOf<Element>;
    //         for (let i = 0; i < divContainer.length; i++) {
    //             divContainer[i].innerHTML = '';
    //         }
    //     }
    // }
}
