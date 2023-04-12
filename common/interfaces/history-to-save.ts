import { MatchType } from '../enums/match-type';

export interface historyToSave {
    startingTime: Date;
    gameMode: MatchType | undefined;
    duration: string;
    player1: string | undefined;
    player2: string | undefined;
    isWinByDefault: boolean;
    isPlayer1Victory: boolean;
}
