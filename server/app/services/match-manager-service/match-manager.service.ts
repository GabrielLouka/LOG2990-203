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
        this.historyStorageService.startingGameTime = new Date();
        return matchToCreate;
    }

    setMatchType(matchId: string, matchType: MatchType) {
        const matchToUpdate = this.getMatchById(matchId);

        if (matchToUpdate) matchToUpdate.matchType = matchType;
    }

    setMatchWinner(matchId: string, winner: Player) {
        const matchToUpdate = this.getMatchById(matchId);
        if (matchToUpdate?.matchStatus === MatchStatus.InProgress) {
            // Victoire normale
            matchToUpdate.matchStatus = winner.playerId === matchToUpdate.player1?.playerId ? MatchStatus.Player1Win : MatchStatus.Player2Win;
            this.storeHistory(matchToUpdate, false);
        }
    }

    setMatchPlayer(matchId: string, player: Player) {
        const matchToUpdate = this.getMatchById(matchId);

        if (matchToUpdate) {
            if (!matchToUpdate.player1) {
                matchToUpdate.player1 = player;
                matchToUpdate.player1Archive = player; // Archive the value of the player
                if (matchToUpdate.matchStatus === MatchStatus.WaitingForPlayer1) matchToUpdate.matchStatus = MatchStatus.WaitingForPlayer2;
            } else {
                matchToUpdate.player2 = player;
                matchToUpdate.player2Archive = player; // Archive the value of the player
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
                // console.log('Partie annulée');
            } else {
                if (modifiedMatch.matchStatus === MatchStatus.InProgress) {
                    // Victoire par default
                    modifiedMatch.matchStatus = modifiedMatch.player1 == null ? MatchStatus.Player2Win : MatchStatus.Player1Win;
                    this.storeHistory(modifiedMatch, true);
                    // console.log('Victoire par default');
                }
            }
            // console.log('Match status remove ', modifiedMatch);
        }

        return modifiedMatch?.matchId ?? null;
    }

    storeHistory(match: Match, isWinByDefault: boolean) {
        this.historyStorageService.player1 = match.player1Archive?.username;
        this.historyStorageService.duration = '10:00';

        this.historyStorageService.gameMode = match.matchType;
        this.historyStorageService.isWinByDefault = isWinByDefault;
        this.historyStorageService.player2 = match.player2Archive?.username;
        this.historyStorageService.isPlayer1Victory = match.matchStatus === MatchStatus.Player1Win;
        this.historyStorageService.storeHistory();
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
