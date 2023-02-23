import { Vector2 } from '@common/vector2';

export abstract class UndoElement {
    constructor(public pixels: Vector2[], public color: string = 'black') {}
    abstract undoEvent(): void;
    abstract redoEvent(): void;
}
