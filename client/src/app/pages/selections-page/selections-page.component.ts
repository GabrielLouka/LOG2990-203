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
            image: '.\\assets\\img\\original-picture.png',
            difficulty: 'DIFFICILE',
            ranking: [
                [
                    { name: 'SnakeDiabet', score: '05:30' },
                    { name: 'NeverTroll', score: '05:30' },
                    { name: 'ibrahim', score: '05:30' },
                ],
                [
                    { name: 'MonsieurPoséMonsieurPosé', score: '05:30' },
                    { name: 'VirusFlying', score: '05:30' },
                    { name: 'CovidSushi', score: '05:30' },
                ],
            ],
        },
        {
            description: 'Hommes de Cro-Magnon',
            image: '.\\assets\\img\\original-picture.png',
            difficulty: 'FACILE',
            ranking: [
                [
                    { name: 'VirusFlying', score: '05:30' },
                    { name: 'MonsieurPosé', score: '05:30' },
                    { name: 'GalacticNoob', score: '05:30' },
                ],
                [
                    { name: 'VirusFlying', score: '05:30' },
                    { name: 'CovidSushi', score: '05:30' },
                    { name: 'GalacticNoob', score: '05:30' },
                ],
            ],
        },
        {
            description: 'Bagnoles',
            image: '.\\assets\\img\\original-picture.png',
            difficulty: 'FACILE',
            ranking: [
                [
                    { name: 'CovidSushi', score: '05:30' },
                    { name: 'NeverTroll', score: '05:30' },
                    { name: 'MonsieurPosé', score: '05:30' },
                ],
                [
                    { name: 'CovidSushi', score: '05:30' },
                    { name: 'GalacticNoob', score: '05:30' },
                    { name: 'CanardMilo', score: '05:30' },
                ],
            ],
        },
        {
            description: 'Playa',
            image: '.\\assets\\img\\original-picture.png',
            difficulty: 'DIFFICILE',
            ranking: [
                [
                    { name: 'CheatRush', score: '05:30' },
                    { name: 'MonsieurPosé', score: '05:30' },
                    { name: 'SnakeDiabet', score: '05:30' },
                ],
                [
                    { name: 'CheatRush', score: '05:30' },
                    { name: 'CanardMilo', score: '05:30' },
                    { name: 'NeverTroll', score: '05:30' },
                ],
            ],
        },
    ];
}
