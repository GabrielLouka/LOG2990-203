import { PEN_WIDTH } from '@common/utils/env';
import { Vector2 } from '@common/vector2';
import { UndoElement } from './undo-element.abstract';

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
    draw(leftContext: CanvasRenderingContext2D): CanvasRenderingContext2D {
        this.leftContext.clearRect(0, 0, leftContext.canvas.width, this.leftContext.canvas.height);
        this.rightContext.clearRect(0, 0, this.leftContext.canvas.width, this.leftContext.canvas.height);
        for (const action of this.actionsToCopy) {
            if (action.isLeftCanvas) {
                if (!(action instanceof SwitchElement)) {
                    action.draw(this.rightContext);
                    action.isLeftCanvas = !action.isLeftCanvas;
                }
            } else {
                if (!(action instanceof SwitchElement)) {
                    action.draw(this.leftContext);
                    action.isLeftCanvas = !action.isLeftCanvas;
                }
            }
        }
        return leftContext;
    }
}
