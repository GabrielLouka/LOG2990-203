/* eslint-disable prettier/prettier */
import { Component } from '@angular/core';
import { History } from '@app/interfaces/history';
@Component({
  selector: 'app-parameter-page',
  templateUrl: './parameter-page.component.html',
  styleUrls: ['./parameter-page.component.scss'],
})
export class ParameterPageComponent {
  gamesHistory: History[] = [
    {
      startingTime: new Date(Date.parse('23 Janvier, 2023 11:13:10')),
      endingTime: new Date(Date.parse('23 Janvier, 2023 11:23:00')),
      gameMode: 'Solo',
      player1: 'Jean',
      player2: 'Marc',
    },
    {
      startingTime: new Date('23 Janvier, 2023 11:13:00'),
      endingTime: new Date('23 Janvier, 2023 11:23:00'),
      gameMode: '1v1',
      player1: 'Marcus',
      player2: 'Katie',
    },
    {
      startingTime: new Date('23 Janvier, 2023 11:13:00'),
      endingTime: new Date('23 Janvier, 2023 11:23:00'),
      gameMode: 'Solo',
      player1: 'Heisenberg',
      player2: 'Jessy',
    },
  ];


  clearHistory() {
    if (this.gamesHistory.length !== 0) {
      if (confirm("Êtes-vous certain de vouloir réinitialiser l'historique des parties jouées?"))
        this.gamesHistory = [];
    }
    else {
      window.alert("L'historique est déjà vide");
    }
  }
}
