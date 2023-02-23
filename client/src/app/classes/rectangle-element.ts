import { Vector2 } from '@common/vector2';
import { UndoElement } from './undo-element.abstract';

export class RectangleElement extends UndoElement {
    color: string = 'black';
    pixels: Vector2[];

    undoEvent(): void {
        throw new Error('Method not implemented.');
    }
    redoEvent(): void {
        throw new Error('Method not implemented.');
    }
}
