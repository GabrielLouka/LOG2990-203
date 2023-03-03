/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Vector2 } from '@common/vector2';
import { UndoElement } from './undo-element.abstract';

export class SwitchElement extends UndoElement {
    actionsToCopy: UndoElement[];
    leftContext: CanvasRenderingContext2D;
    rightContext: CanvasRenderingContext2D;
    constructor(public isLeftCanvas: boolean = true, public pixels: Vector2[] = [new Vector2(0, 0)]) {
        super(pixels, isLeftCanvas, 20, 'black');
    }
    loadCanvases(actionsToCopy: UndoElement[], leftContext: CanvasRenderingContext2D, rightContext: CanvasRenderingContext2D) {
        this.actionsToCopy = actionsToCopy;
        this.leftContext = leftContext;
        this.rightContext = rightContext;
    }
    draw(leftContext: CanvasRenderingContext2D): CanvasRenderingContext2D {
        const tempCanvas = document.createElement('canvas');
        const tempContext = tempCanvas.getContext('2d') as CanvasRenderingContext2D;

        tempCanvas.width = leftContext.canvas.width;
        tempCanvas.height = leftContext.canvas.height;
        tempContext.drawImage(this.leftContext.canvas, 0, 0);

        this.leftContext.clearRect(0, 0, this.leftContext.canvas.width, this.leftContext.canvas.height);
        this.leftContext.drawImage(this.rightContext.canvas, 0, 0);

        this.rightContext.clearRect(0, 0, this.rightContext.canvas.width, this.rightContext.canvas.height);
        this.rightContext.drawImage(tempCanvas, 0, 0);
        for (const action of this.actionsToCopy) {
            action.isLeftCanvas = !action.isLeftCanvas;
        }
        return this.leftContext;
    }
}
