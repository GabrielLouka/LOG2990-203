import { Player } from '@common/player';
export class Match {
    // this is the id for the game that is being played
    // it's not the same as match id which is the
    // unique identifier for this match
    gameId: number;
    // unique id for this match
    matchId: string;
    player1: Player | null;
    player2: Player | null;

    constructor(gameId: number, matchId: string) {
        this.gameId = gameId;
        this.matchId = matchId;
    }
}
