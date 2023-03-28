export interface Ranking {
    name: string;
    score: string;
}

export const defaultRanking: Ranking[] = [
    { name: 'Player 1', score: '30:00' },
    { name: 'Player 2', score: '31:00' },
    { name: 'Player 3', score: '32:00' },
];
