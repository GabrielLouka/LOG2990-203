import { Player } from "@common/classes/player";

export interface HistoryData {
    startingTime: string | null | Date;
    duration: string;
    gameMode: string;
    player1: Player | null;
    player2: Player | null;
    isWinningByDefault: boolean;
}
