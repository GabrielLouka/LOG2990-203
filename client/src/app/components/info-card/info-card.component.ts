import { Component, Input } from '@angular/core';
import { MatchType } from '@common/enums/match-type';

@Component({
    selector: 'app-info-card',
    templateUrl: './info-card.component.html',
    styleUrls: ['./info-card.component.scss'],
})
export class InfoCardComponent {
    @Input() isEasy: boolean;
    @Input() matchType: MatchType | undefined;

    get difficulty() {
        return this.isEasy ? 'Facile' : 'Difficile';
    }

    get matchTypeToString(): string {
        switch (this.matchType) {
            case MatchType.Solo: {
                return 'Classique Solo';
            }
            case MatchType.OneVersusOne: {
                return 'Classique 1v1';
            }
            case MatchType.LimitedCoop: {
                return 'Temps Limité coop';
            }
            case MatchType.LimitedVersus: {
                return 'Temps Limité 1v1';
            }
            default: {
                return 'sus';
            }
        }
    }
}
