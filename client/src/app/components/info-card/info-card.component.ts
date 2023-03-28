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
                return 'Classique solo';
            }
            case MatchType.OneVersusOne: {
                return 'Classique une contre une';
            }
            case MatchType.LimitedCoop: {
                return 'Limité corporatif';
            }
            case MatchType.LimitedVersus: {
                return 'Limité une contre un';
            }
            default: {
                return 'Indéterminé';
            }
        }
    }
}
