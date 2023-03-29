/* eslint-disable no-console */
import { Component, OnInit } from '@angular/core';
import { HistoryService } from '@app/services/history-service/history.service';

@Component({
    selector: 'app-parameter-page',
    templateUrl: './parameter-page.component.html',
    styleUrls: ['./parameter-page.component.scss'],
})
export class ParameterPageComponent implements OnInit {
    constructor(readonly historyService: HistoryService) {}

    ngOnInit(): void {
        this.historyService.fetchHistoryFromServer();
    }
}
