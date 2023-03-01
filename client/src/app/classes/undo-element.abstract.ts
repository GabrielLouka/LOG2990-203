import { Vector2 } from '@common/vector2';

export abstract class UndoElement {
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    constructor(public pixels: Vector2[], public isLeftCanvas: boolean, public penWidth = 20, public color: string = 'black') {}
    abstract draw(context: CanvasRenderingContext2D): CanvasRenderingContext2D;
}
