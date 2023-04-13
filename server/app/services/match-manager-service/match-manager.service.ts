/* eslint-disable complexity */
import { Match } from '@common/classes/match';
import { Player } from '@common/classes/player';
import { MatchStatus } from '@common/enums/match-status';
import { MatchType } from '@common/enums/match-type';
import { historyToSave } from '@common/interfaces/history-to-save';
import { Service } from 'typedi';
// eslint-disable-next-line no-restricted-imports
import { HistoryStorageService } from '../history-storage-service/history-storage.service';

@Service()
export class MatchManagerService {
    private startingTime: Date;
    private currentOnlinePlayedMatches: Match[] = [];

    constructor(private historyStorageService: HistoryStorageService) {}

    get currentMatches(): Match[] {
        return this.currentOnlinePlayedMatches;
    }

    createMatch(gameId: number, matchId: string): Match {
        const matchToCreate = new Match(gameId, matchId);
        matchToCreate.matchStatus = MatchStatus.WaitingForPlayer1;
        this.currentOnlinePlayedMatches.push(matchToCreate);
        this.startingTime = new Date();
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

            if (
                (matchToUpdate.player1 === null && matchToUpdate.player1Archive !== null) ||
                (matchToUpdate.player2 === null && matchToUpdate.player2Archive !== null)
            ) {
                if (matchToUpdate.matchType === MatchType.LimitedSolo) {
                    this.storeHistory(matchToUpdate, true);
                } else {
                    this.storeHistory(matchToUpdate, false);
                }
            } else {
                this.storeHistory(matchToUpdate, false);
            }
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
            } else {
                if (
                    modifiedMatch.matchStatus === MatchStatus.InProgress &&
                    (modifiedMatch.matchType === MatchType.OneVersusOne || modifiedMatch.matchType === MatchType.Solo)
                ) {
                    // Victoire par default
                    modifiedMatch.matchStatus = modifiedMatch.player1 == null ? MatchStatus.Player2Win : MatchStatus.Player1Win;
                    this.storeHistory(modifiedMatch, true);
                } else if (modifiedMatch.matchType === MatchType.LimitedCoop) {
                    modifiedMatch.matchType = MatchType.LimitedSolo;
                }
            }
        }

        return modifiedMatch?.matchId ?? null;
    }

    storeHistory(match: Match, isWinByDefault: boolean) {
        const newHistory: historyToSave = {
            startingTime: this.startingTime,
            gameMode: match.matchType,
            duration: this.formatDuration(this.startingTime, new Date()),
            player1: match.player1Archive?.username,
            player2: match.player2Archive?.username,
            isWinByDefault,
            isPlayer1Victory: match.matchStatus === MatchStatus.Player1Win,
        };
        this.historyStorageService.storeHistory(newHistory);
    }

    formatDuration(startDate: Date, endDate: Date): string {
        const diff = Math.abs(endDate.getTime() - startDate.getTime());
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
