export interface Ranking {
    name: string;
    score: string;
}

export const defaultRankings: Ranking[][] = [
    [
      { name: "Player 1", score: "0" },
      { name: "Player 2", score: "0" }
    ],
    [    { name: "Player 3", score: "0" },    { name: "Player 4", score: "0" }  ]
  ];
