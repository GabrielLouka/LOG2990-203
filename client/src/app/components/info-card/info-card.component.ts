import { Component, Input } from '@angular/core';
import { MatchType } from '@common/enums/match-type';

@Component({
    selector: 'app-info-card',
    templateUrl: './info-card.component.html',
    styleUrls: ['./info-card.component.scss'],
})
export class InfoCardComponent {
    @Input() isEasy: boolean | undefined;
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
                return 'Temps Limité Coop';
            }
            case MatchType.LimitedSolo: {
                return 'Temps Limité Solo';
            }
            default: {
                return 'sus';
            }
        }
    }

    get isClassicMode() {
        return this.matchType === MatchType.Solo || this.matchType === MatchType.LimitedSolo;
    }

    get isOneVersusOne() {
        return this.matchType === MatchType.OneVersusOne;
    }

    get matchMode() {
        return this.matchTypeToString;
    }
}
