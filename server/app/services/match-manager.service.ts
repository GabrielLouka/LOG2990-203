import { Match } from '@common/match';
import { MatchStatus } from '@common/match-status';
import { MatchType } from '@common/match-type';
import { Player } from '@common/player';
import { Service } from 'typedi';

@Service()
export class MatchManagerService {
    private currentOnlinePlayedMatches: Match[] = [];

    get currentMatches() {
        return this.currentOnlinePlayedMatches;
    }

    createMatch(gameId: number, matchId: string): Match {
        const matchToCreate = new Match(gameId, matchId);
        matchToCreate.matchStatus = MatchStatus.WaitingForPlayer1;
        this.currentOnlinePlayedMatches.push(matchToCreate);

        return matchToCreate;
    }

    setMatchType(matchId: string, matchType: MatchType) {
        const matchToChange = this.getMatchById(matchId);

        if (matchToChange != null) {
            matchToChange.matchType = matchType;
        }
    }

    setMatchPlayer(matchId: string, player: Player) {
        const matchToChange = this.getMatchById(matchId);

        if (matchToChange != null) {
            if (matchToChange.player1 == null) {
                matchToChange.player1 = player;
                if (matchToChange.matchStatus === MatchStatus.WaitingForPlayer1) matchToChange.matchStatus = MatchStatus.WaitingForPlayer2;
            } else {
                matchToChange.player2 = player;
                if (matchToChange.matchStatus === MatchStatus.WaitingForPlayer2) matchToChange.matchStatus = MatchStatus.InProgress;
            }
        }
    }

    removePlayerFromMatch(playerId: string): string | null {
        let modifiedMatch: Match | null = null;
        for (const match of this.currentOnlinePlayedMatches) {
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
            if (modifiedMatch.player1 == null && modifiedMatch.matchStatus === MatchStatus.WaitingForPlayer2)
                modifiedMatch.matchStatus = MatchStatus.Aborted;
            else modifiedMatch.matchStatus = modifiedMatch.player1 == null ? MatchStatus.Player2Win : MatchStatus.Player1Win;
        }

        return modifiedMatch?.matchId ?? null;
    }

    getMatchById(matchId: string): Match | null {
        for (const match of this.currentOnlinePlayedMatches) {
            if (match.matchId.toString() === matchId.toString()) {
                return match;
            }
        }
        return null;
    }

    getMatchAvailableForGame(gameId: number): string | null {
        for (const match of this.currentOnlinePlayedMatches) {
            if (match.gameId.toString() === gameId.toString() && match.matchType === MatchType.OneVersusOne) {
                if (match.matchStatus === MatchStatus.WaitingForPlayer2) return match.matchId;
            }
        }
        return null;
    }
}
