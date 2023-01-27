/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable no-unused-vars */
/* eslint-disable no-restricted-imports */
/* eslint-disable no-useless-escape */
/* eslint-disable prettier/prettier */
import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { Classements } from '@app/interfaces/classements';
import { Game } from '../../interfaces/games';

@Component({
    selector: 'app-configuration-page',
    templateUrl: './configuration-page.component.html',
    styleUrls: ['./configuration-page.component.scss'],
})

export class ConfigurationPageComponent {
    title = 'Page de configuration';
    playable = false;
    
    resetClassement:Classements[] = [ 
        { name: 'PlayerA', score: "10:00" },
        { name: 'PlayerB', score: "10:00" },
        { name: 'PlayerC', score: "10:00" }
    ];
    
    games: Game[] = [
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
    ];
    constructor(private location: Location) {}


    over() {
        const subBox = document.getElementById('sub-box');
        if (subBox) {
            subBox.className = 'game-buttons';
        }
    }
    previousPage() {
        this.location.back();
    }
    
    resetButton(){
        if(confirm('Are you sure you want to reset all the games')){
            for(let i=0; i<this.games.length;i++ ){
                for(let j=0; j<this.games[i].ranking.length;j++){
                    this.games[i].ranking[j]=this.resetClassement;
                }
            }
        }
    }
    deleteButton(){
        if(confirm('Are you sure you want to delete all the games')){
            const divContainer:HTMLCollectionOf<Element> = document.getElementsByClassName('sub-container') as HTMLCollectionOf<Element>;
            for(let i=0; i<divContainer.length;i++){
                divContainer[i].innerHTML='';
            }      
        }

    
    }
}
