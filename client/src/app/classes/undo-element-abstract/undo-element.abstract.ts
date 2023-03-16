import { PEN_WIDTH } from '@common/utils/env';
import { Vector2 } from '@common/vector2';
export abstract class UndoElement {
    constructor(public pixels: Vector2[], public isLeftCanvas: boolean, public penWidth = PEN_WIDTH, public color: string = 'black') {}
    abstract draw(context: CanvasRenderingContext2D): CanvasRenderingContext2D;
}
