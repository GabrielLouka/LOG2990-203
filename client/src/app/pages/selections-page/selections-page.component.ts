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

    games: Game[] = [
        {
            description: 'Glouton',
            image: '.\\assets\\img\\game-icon.png',
            difficulty: 'DIFFICILE',
            mode: 'Classique',
            nbHints: 3,
            hintsPenalty: 10,
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
            mode: 'Classique',
            nbHints: 3,
            hintsPenalty: 10,
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
            mode: 'Classique',
            nbHints: 3,
            hintsPenalty: 10,
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
            mode: 'Classique',
            nbHints: 3,
            hintsPenalty: 10,
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
    ];
}
