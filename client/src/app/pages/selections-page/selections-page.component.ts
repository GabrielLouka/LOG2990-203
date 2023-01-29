import { Component } from '@angular/core';
// eslint-disable-next-line no-restricted-imports
import { Game } from '@app/interfaces/games';

@Component({
    selector: 'app-selections-page',
    templateUrl: './selections-page.component.html',
    styleUrls: ['./selections-page.component.scss'],
})
export class SelectionsPageComponent {
    playable = true;
    currentIndex = 0;
    games: Game[][] = [
        [
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
                        { name: 'ibrahim', score: '05:30' },
                        { name: 'ibrahim', score: '05:30' },
                        { name: 'ibrahim', score: '05:30' },
                    ],
                    [
                        { name: 'ibrahim', score: '05:30' },
                        { name: 'ibrahim', score: '05:30' },
                        { name: 'ibrahim', score: '05:30' },
                    ],
                ],
            },
            {
                description: 'Hommes de Cro-Magnon',
                image: '.\\assets\\img\\game-icon.png',
                difficulty: 'FACILE',
                ranking: [
                    [
                        { name: 'ibrahim', score: '05:30' },
                        { name: 'ibrahim', score: '05:30' },
                        { name: 'ibrahim', score: '05:30' },
                    ],
                    [
                        { name: 'ibrahim', score: '05:30' },
                        { name: 'ibrahim', score: '05:30' },
                        { name: 'ibrahim', score: '05:30' },
                    ],
                ],
            },
            {
                description: 'Bagnoles',
                image: '.\\assets\\img\\game-icon.png',
                difficulty: 'FACILE',
                ranking: [
                    [
                        { name: 'ibrahim', score: '05:30' },
                        { name: 'ibrahim', score: '05:30' },
                        { name: 'ibrahim', score: '05:30' },
                    ],
                    [
                        { name: 'ibrahim', score: '05:30' },
                        { name: 'ibrahim', score: '05:30' },
                        { name: 'ibrahim', score: '05:30' },
                    ],
                ],
            },
            {
                description: 'Playa',
                image: '.\\assets\\img\\game-icon.png',
                difficulty: 'DIFFICILE',
                ranking: [
                    [
                        { name: 'ibrahim', score: '05:30' },
                        { name: 'ibrahim', score: '05:30' },
                        { name: 'ibrahim', score: '05:30' },
                    ],
                    [
                        { name: 'ibrahim', score: '05:30' },
                        { name: 'ibrahim', score: '05:30' },
                        { name: 'ibrahim', score: '05:30' },
                    ],
                ],
            },
        ],
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
}
