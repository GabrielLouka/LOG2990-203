import { Component, OnInit } from '@angular/core';
import { GameConstantsService } from '@app/services/game-constants-service/game-constants.service';

@Component({
    selector: 'app-parameter-page',
    templateUrl: './parameter-page.component.html',
    styleUrls: ['./parameter-page.component.scss'],
})
export class ParameterPageComponent implements OnInit {
    constructor(public gameConstantsService: GameConstantsService) {}

    ngOnInit(): void {
        this.gameConstantsService.initGameConstants();
    }
}
