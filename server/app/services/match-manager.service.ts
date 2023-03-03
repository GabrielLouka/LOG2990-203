/* eslint-disable no-console */
import { Match } from '@common/match';
import { MatchStatus } from '@common/match-status';
import { MatchType } from '@common/match-type';
import { Player } from '@common/player';
import { Service } from 'typedi';

@Service()
export class MatchManagerService {
    private currentMatches: Match[] = []; // current online games being played

    get matches() {
        return this.currentMatches;
    }

    // create a new match and return it
    createMatch(gameId: number, matchId: string): Match {
        const matchToCreate = new Match(gameId, matchId);
        matchToCreate.matchStatus = MatchStatus.WaitingForPlayer1;
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
                if (matchToChange.matchStatus === MatchStatus.WaitingForPlayer1) matchToChange.matchStatus = MatchStatus.WaitingForPlayer2;
                console.log('set match ' + matchId + ' player 1' + ' to ' + player.username);
            } else {
                matchToChange.player2 = player;
                if (matchToChange.matchStatus === MatchStatus.WaitingForPlayer2) matchToChange.matchStatus = MatchStatus.InProgress;
                console.log('set match ' + matchId + ' player 2' + ' to ' + player.username);
            }

            // if (matchToChange.player1 != null && matchToChange.player2 != null) {
            //     matchToChange.matchStatus = MatchStatus.InProgress;
            // }
        } else {
            console.log('match ' + matchId + ' not found');
        }
    }

    // this is called when a player disconnects
    // if the player is in a match, remove him from the match
    // returns the matchId of the match that was removed
    removePlayerFromMatch(playerId: string): string | null {
        let modifiedMatch: Match | null = null;
        for (const match of this.currentMatches) {
            if (match.player1?.playerId === playerId) {
                match.player1 = null;
                modifiedMatch = match;
                break;
            }
            if (match.player2?.playerId === playerId) {
                match.player2 = null;
                modifiedMatch = match;
                break;
            }
        }

        if (modifiedMatch != null) {
            modifiedMatch.matchStatus = modifiedMatch.player1 == null ? MatchStatus.Player2Win : MatchStatus.Player1Win;
            console.log('match ' + modifiedMatch.matchId + ' status changed to ' + modifiedMatch.matchStatus.toString());
        }

        return modifiedMatch?.matchId ?? null;
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
                if (match.matchStatus === MatchStatus.WaitingForPlayer2) return match.matchId;
            }
        }
        return null;
    }
}
