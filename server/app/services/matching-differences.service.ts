import { GAME_CONST } from '@app/utils/env';
import { GameData } from '@common/game-data';
import { Vector2 } from '@common/vector2';
import { Service } from 'typedi';

@Service()
export class MatchingDifferencesService {
    // This will return the index of the difference that was clicked, or -1 if no difference was clicked
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
        return GAME_CONST.notFound;
    }
}
