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

    get countdownValue(): number {
        return this.constants.countdownValue;
    }

    get penaltyValue(): number {
        return this.constants.penaltyValue;
    }

    get bonusValue(): number {
        return this.constants.bonusValue;
    }

    initGameConstants() {
        const routeToSend = '/game_constants';
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
        const { countdownValue, penaltyValue, bonusValue } = this.constants;
        const routeToSend = '/game_constants';
        if (isReset) {
            this.constants = {
                countdownValue: INITIAL_COUNTDOWN,
                penaltyValue: INITIAL_PENALTY,
                bonusValue: INITIAL_BONUS,
            };
        } else if (countdownValue === INITIAL_COUNTDOWN && penaltyValue === INITIAL_PENALTY && bonusValue === INITIAL_BONUS) {
            return;
        } else {
            this.communicationService.post(this.constants, routeToSend).subscribe({});
        }
    }
}
