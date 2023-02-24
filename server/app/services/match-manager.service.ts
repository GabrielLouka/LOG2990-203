/* eslint-disable no-console */
import { Match } from '@common/match';
import { MatchType } from '@common/match-type';
import { Player } from '@common/player';
import { Service } from 'typedi';

@Service()
export class MatchManagerService {
    currentMatches: Match[] = []; // current online games being played

    // create a new match and return it
    createMatch(gameId: number, matchId: string): Match {
        const matchToCreate = new Match(gameId, matchId);
        this.currentMatches.push(matchToCreate);

        return matchToCreate;
    }

    setMatchType(matchId: string, matchType: MatchType) {
        const matchToChange = this.getMatchById(matchId);

        if (matchToChange != null) {
            matchToChange.matchType = matchType;
            console.log('set match ' + matchId + ' type to ' + matchType);
            console.log('match type is now ' + this.getMatchById(matchId)?.matchType);
        }
    }

    setMatchPlayer(matchId: string, player: Player) {
        const matchToChange = this.getMatchById(matchId);

        if (matchToChange != null) {
            if (matchToChange.player1 == null) {
                matchToChange.player1 = player;
                console.log('set match ' + matchId + ' player 1' + ' to ' + player.username);
            } else {
                matchToChange.player2 = player;
                console.log('set match ' + matchId + ' player 2' + ' to ' + player.username);
            }
        } else {
            console.log('match ' + matchId + ' not found');
        }
    }

    getMatchById(matchId: string): Match | null {
        for (const match of this.currentMatches) {
            if (match.matchId.toString() === matchId.toString()) {
                return match;
            }
        }

        // eslint-disable-next-line no-console
        console.log("Couldn't find match " + matchId);
        return null;
    }

    // if there is someone waiting for a match, return the matchId
    // otherwise, return null
    getMatchAvailableForGame(gameId: number): string | null {
        for (const match of this.currentMatches) {
            if (match.gameId.toString() === gameId.toString() && match.matchType === MatchType.OneVersusOne) {
                if (match.player1 != null && match.player2 == null) return match.matchId;
            }
        }
        return null;
    }
}
