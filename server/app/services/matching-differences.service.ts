import { GameData } from '@common/game-data';
import { NOT_FOUND } from '@common/utils/env';
import { Vector2 } from '@common/vector2';
import { Service } from 'typedi';

@Service()
export class MatchingDifferencesService {
    getDifferenceIndex(game: GameData, clickPosition: Vector2): number {
        const differences = game.differences;
        for (let i = 0; i < differences.length; i++) {
            const difference = differences[i];
            for (const position of difference) {
                if (position.x === clickPosition.x && position.y === clickPosition.y) {
                    return i;
                }
            }
        }
        return NOT_FOUND;
    }
}
