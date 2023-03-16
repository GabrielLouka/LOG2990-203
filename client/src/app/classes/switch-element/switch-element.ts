import { UndoElement } from '@app/classes/undo-element-abstract/undo-element.abstract';
import { PEN_WIDTH } from '@common/utils/env';
import { Vector2 } from '@common/vector2';

export class SwitchElement extends UndoElement {
    actionsToCopy: UndoElement[];
    leftContext: CanvasRenderingContext2D;
    rightContext: CanvasRenderingContext2D;
    constructor(public isLeftCanvas: boolean = true, public pixels: Vector2[] = [new Vector2(0, 0)]) {
        super(pixels, isLeftCanvas, PEN_WIDTH, 'black');
    }
    loadCanvases(actionsToCopy: UndoElement[], leftContext: CanvasRenderingContext2D, rightContext: CanvasRenderingContext2D) {
        this.actionsToCopy = actionsToCopy;
        this.leftContext = leftContext;
        this.rightContext = rightContext;
    }
    applyElementAction(leftContext: CanvasRenderingContext2D): CanvasRenderingContext2D {
        this.leftContext.clearRect(0, 0, leftContext.canvas.width, this.leftContext.canvas.height);
        this.rightContext.clearRect(0, 0, this.leftContext.canvas.width, this.leftContext.canvas.height);
        for (const action of this.actionsToCopy) {
            if (!(action instanceof SwitchElement)) {
                action.applyElementAction(action.isLeftCanvas ? this.rightContext : this.leftContext);
                action.isLeftCanvas = !action.isLeftCanvas;
            }
        }
        return leftContext;
    }
}
