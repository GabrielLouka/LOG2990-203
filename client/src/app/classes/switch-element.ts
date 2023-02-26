import { Vector2 } from '@common/vector2';
import { UndoElement } from './undo-element.abstract';

export class SwitchElement extends UndoElement {
    actionsToCopy: UndoElement[];
    rightContext: CanvasRenderingContext2D;
    constructor(public isLeftCanvas: boolean = true, public pixels: Vector2[] = [new Vector2(0, 0)]) {
        super(pixels, 'black', isLeftCanvas);
    }
    loadActions(actionsToCopy: UndoElement[], rightContext: CanvasRenderingContext2D) {
        this.actionsToCopy = actionsToCopy;
        this.rightContext = rightContext;
    }
    draw(leftContext: CanvasRenderingContext2D): CanvasRenderingContext2D {
        leftContext.clearRect(0, 0, leftContext.canvas.width, leftContext.canvas.height);
        this.rightContext.clearRect(0, 0, leftContext.canvas.width, leftContext.canvas.height);
        for (const action of this.actionsToCopy) {
            if (action.isLeftCanvas !== this.isLeftCanvas) {
                action.draw(leftContext);
            } else {
                action.draw(this.rightContext);
            }
        }
        return this.rightContext;
    }
}
