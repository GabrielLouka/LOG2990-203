export interface Ranking {
    name: string;
    score: string;
}

export const defaultRankings: Ranking[][] = [
    [
        { name: 'Player 1', score: '10:00' },
        { name: 'Player 2', score: '10:00' },
        { name: 'Player 3', score: '10:00' },
    ],
    [
        { name: 'Player 1', score: '10:00' },
        { name: 'Player 2', score: '10:00' },
        { name: 'Player 3', score: '10:00' },
    ],
];
