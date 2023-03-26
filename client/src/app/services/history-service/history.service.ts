/* eslint-disable no-console */
import { Injectable } from '@angular/core';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { HistoryData } from '@common/interfaces/history-data';

@Injectable({
    providedIn: 'root',
})
export class HistoryService {
    history: HistoryData[] = [];

    constructor(private readonly communicationService: CommunicationService) {}

    fetchHistoryFromServer() {
        const routeToSend = '/history/fetchHistory/';
        this.communicationService.get(routeToSend).subscribe({
            next: (response) => {
                if (response.body !== null) {
                    this.history = JSON.parse(response.body);
                }
            },
        });
    }

    getHistory(): HistoryData[] {
        return this.history;
    }
}
