import { Match } from '@app/classes/match';
import { Service } from 'typedi';
@Service()
export class MatchManagerService {
    currentMatches: Match[] = []; // current online games being played

    createMatch(gameId: number, matchId: string) {
        this.currentMatches.push(new Match(gameId, matchId));
    }

    noOp() {
        return;
    }

    isMatchAvailableForGame(gameId: number) {
        for (const match of this.currentMatches) {
            if (match.gameId.toString() === gameId.toString()) {
                // eslint-disable-next-line no-console
                console.log('checking match ' + match.gameId);
                if (/* match.player1 !== null &&*/ match.player2 == null) return true;
            }
        }
        // eslint-disable-next-line no-console
        // console.log('trying to find ' + gameId);
        return false;
    }
}
