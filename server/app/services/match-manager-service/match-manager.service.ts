/* eslint-disable complexity */
import { Match } from '@common/classes/match';
import { Player } from '@common/classes/player';
import { MatchStatus } from '@common/enums/match-status';
import { MatchType } from '@common/enums/match-type';
import { Service } from 'typedi';
// eslint-disable-next-line no-restricted-imports
import { HistoryStorageService } from '../history-storage-service/history-storage.service';

@Service()
export class MatchManagerService {
    private currentOnlinePlayedMatches: Match[] = [];

    constructor(private historyStorageService: HistoryStorageService) {}

    get currentMatches(): Match[] {
        return this.currentOnlinePlayedMatches;
    }

    createMatch(gameId: number, matchId: string): Match {
        const matchToCreate = new Match(gameId, matchId);
        matchToCreate.matchStatus = MatchStatus.WaitingForPlayer1;
        this.currentOnlinePlayedMatches.push(matchToCreate);
        return matchToCreate;
    }

    setMatchType(matchId: string, matchType: MatchType) {
        const matchToUpdate = this.getMatchById(matchId);

        if (matchToUpdate) matchToUpdate.matchType = matchType;
    }

    setMatchWinner(matchId: string, winner: Player) {
        const matchToUpdate = this.getMatchById(matchId);
        if (matchToUpdate?.matchStatus === MatchStatus.InProgress) {
            matchToUpdate.matchStatus = winner.playerId === matchToUpdate.player1?.playerId ? MatchStatus.Player1Win : MatchStatus.Player2Win;
        }

        // eslint-disable-next-line no-console
        // console.log('Match winner set : ' + JSON.stringify(matchToUpdate));
    }

    setMatchPlayer(matchId: string, player: Player) {
        const matchToUpdate = this.getMatchById(matchId);

        if (matchToUpdate) {
            if (!matchToUpdate.player1) {
                matchToUpdate.player1 = player;
                if (matchToUpdate.matchStatus === MatchStatus.WaitingForPlayer1) matchToUpdate.matchStatus = MatchStatus.WaitingForPlayer2;
            } else {
                matchToUpdate.player2 = player;
                if (matchToUpdate.matchStatus === MatchStatus.WaitingForPlayer2) matchToUpdate.matchStatus = MatchStatus.InProgress;
            }

            if ((matchToUpdate.matchType === MatchType.Solo || matchToUpdate.matchType === MatchType.LimitedSolo) && matchToUpdate.player1) {
                matchToUpdate.matchStatus = MatchStatus.InProgress;
            }
        }
    }

    // TODO: ESSAYER DE COMPRENDRE LA LOGIQUE DE CETTE FONCTOIN :'(
    removePlayerFromMatch(playerId: string): string | null {
        let modifiedMatch: Match | null = null;
        for (const match of this.currentOnlinePlayedMatches) {
            if ((match.matchStatus === MatchStatus.InProgress || match.matchStatus === MatchStatus.Player1Win) && match.player2 === undefined) {
                this.historyStorageService.player1 = match.player1;
                this.historyStorageService.duration = '10:00';
                this.historyStorageService.startingGameTime = new Date();

                this.historyStorageService.gameMode = match.matchType;
                this.historyStorageService.endStatus = match.matchStatus;

                this.historyStorageService.storeHistory();
            }
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

        if (modifiedMatch) {
            if (!modifiedMatch.player1 && modifiedMatch.matchStatus === MatchStatus.WaitingForPlayer2) {
                modifiedMatch.matchStatus = MatchStatus.Aborted;
            } else {
                if (modifiedMatch.matchType !== MatchType.LimitedCoop && modifiedMatch.matchType !== MatchType.LimitedSolo) {
                    modifiedMatch.matchStatus = modifiedMatch.player1 == null ? MatchStatus.Player2Win : MatchStatus.Player1Win;
                } else {
                    modifiedMatch.matchType = MatchType.LimitedSolo;
                }
            }
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
            if (
                match.gameId.toString() === gameId.toString() &&
                (match.matchType === MatchType.OneVersusOne || match.matchType === MatchType.LimitedCoop)
            ) {
                if (match.matchStatus === MatchStatus.WaitingForPlayer2) {
                    return match.matchId;
                }
            }
        }
        return null;
    }
}
