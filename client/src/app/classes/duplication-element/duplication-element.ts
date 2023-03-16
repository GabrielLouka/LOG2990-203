/* eslint-disable @typescript-eslint/no-magic-numbers */
import { UndoElement } from '@app/classes/undo-element-abstract/undo-element.abstract';
import { Vector2 } from '@common/vector2';

export class DuplicationElement extends UndoElement {
    actionsToCopy: UndoElement[];
    constructor(public isLeftCanvas: boolean = true, public pixels: Vector2[] = [new Vector2(0, 0)]) {
        super(pixels, isLeftCanvas, 20, 'black');
    }
    loadActions(actionsToCopy: UndoElement[]) {
        this.actionsToCopy = actionsToCopy;
    }
    draw(context: CanvasRenderingContext2D): CanvasRenderingContext2D {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        for (const action of this.actionsToCopy) {
            if (action.isLeftCanvas !== this.isLeftCanvas) {
                action.draw(context);
            }
        }
        return context;
    }
}
