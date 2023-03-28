/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Component, ElementRef, ViewChild } from '@angular/core';
import { INITIAL_BONUS, INITIAL_COUNTDOWN, INITIAL_PENALTY, MAX_BONUS, MAX_PENALTY } from '@common/utils/env';

@Component({
    selector: 'app-parameter-page',
    templateUrl: './parameter-page.component.html',
    styleUrls: ['./parameter-page.component.scss'],
})
export class ParameterPageComponent {
    @ViewChild('rangeValue') rangeValue: ElementRef;

    countdownValue = INITIAL_COUNTDOWN;
    penaltyValue = INITIAL_PENALTY;
    bonusValue = INITIAL_BONUS;

    rangeSlide() {
        this.rangeValue.nativeElement.value = this.countdownValue;
    }

    updateValue(isPenalty: boolean, isSubtraction: boolean) {
        if (isSubtraction) {
            if (this.penaltyValue > 0 && isPenalty) this.penaltyValue--;
            if (this.bonusValue > 0 && !isPenalty) this.bonusValue--;
        } else {
            if (this.penaltyValue < MAX_PENALTY && isPenalty) this.penaltyValue++;
            if (this.bonusValue < MAX_BONUS && !isPenalty) this.bonusValue++;
        }
    }

    resetValues() {
        this.countdownValue = INITIAL_COUNTDOWN;
        this.penaltyValue = INITIAL_PENALTY;
        this.bonusValue = INITIAL_BONUS;
    }
}
