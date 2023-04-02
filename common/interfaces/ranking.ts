import { THIRTY_MINUTES_TO_SECONDS, THIRTY_ONE_MINUTES_TO_SECONDS, THIRTY_TWO_MINUTES_TO_SECONDS } from '@common/utils/env';
export interface Ranking {
    name: string;
    score: number;
}

export const defaultRanking: Ranking[] = [
    { name: 'Player 1', score: THIRTY_MINUTES_TO_SECONDS },
    { name: 'Player 2', score: THIRTY_ONE_MINUTES_TO_SECONDS },
    { name: 'Player 3', score: THIRTY_TWO_MINUTES_TO_SECONDS },
];
