import { Injectable } from '@angular/core';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { INITIAL_BONUS, INITIAL_COUNTDOWN, INITIAL_PENALTY } from '@common/utils/env';

@Injectable({
    providedIn: 'root',
})
export class GameConstantsService {
    constants = {
        countdownValue: 0,
        penaltyValue: 0,
        bonusValue: 0,
    };

    constructor(public communicationService: CommunicationService) {}

    initGameConstants() {
        const routeToSend = '/game_constants/fetchConstants';
        this.communicationService.get(routeToSend).subscribe({
            next: (response) => {
                if (response.body) {
                    const serverResult = JSON.parse(response.body);
                    this.constants.countdownValue = serverResult.countdownValue;
                    this.constants.penaltyValue = serverResult.penaltyValue;
                    this.constants.bonusValue = serverResult.bonusValue;
                }
            },
        });
    }

    updateConstants(isReset: boolean) {
        const routeToSend = '/game_constants/updateConstants';
        if (isReset) {
            this.constants.countdownValue = INITIAL_COUNTDOWN;
            this.constants.penaltyValue = INITIAL_PENALTY;
            this.constants.bonusValue = INITIAL_BONUS;
        }
        this.communicationService.post(this.constants, routeToSend).subscribe({});
    }
}
