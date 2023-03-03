/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Vector2 } from '@common/vector2';
import { UndoElement } from './undo-element.abstract';

export class ClearElement extends UndoElement {
    actionsToCopy: UndoElement[];
    leftContext: CanvasRenderingContext2D;
    rightContext: CanvasRenderingContext2D;
    constructor(public isLeftCanvas: boolean = true, public pixels: Vector2[] = [new Vector2(0, 0)]) {
        super(pixels, isLeftCanvas, 20, 'black');
    }
    clear(context: CanvasRenderingContext2D) {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    }

    draw(context: CanvasRenderingContext2D): CanvasRenderingContext2D {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        return context;
    }
}
