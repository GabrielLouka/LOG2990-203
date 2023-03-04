import { MatchStatus } from './match-status';
import { MatchType } from './match-type';
import { Player } from './player';
export class Match {
    // this is the id for the game that is being played
    // it's not the same as match id which is the
    // unique identifier for this match
    gameId: number;
    // unique id for this match
    // this is equal to the socket Id of the host (player 1)
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
