import { MatchStatus } from './match-status';
import { MatchType } from './match-type';
import { Player } from './player';
export class Match {
    gameId: number;
    matchId: string;
    player1: Player | null;
    player2: Player | null;
    matchType: MatchType;
    matchStatus: MatchStatus;

    constructor(gameId: number, matchId: string) {
        this.gameId = gameId;
        this.matchId = matchId;
        this.matchStatus = MatchStatus.WaitingForPlayer1;
    }
}
