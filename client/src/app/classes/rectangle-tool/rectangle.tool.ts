import { AbstractTool } from '@app/classes/abstract-tool/abstract.tool';
import { ClearElement } from '@app/classes/clear-element/clear-element';
import { RectangleElement } from '@app/classes/rectangle-element/rectangle-element';
import { SwitchElement } from '@app/classes/switch-element/switch-element';
import { UndoElement } from '@app/classes/undo-element-abstract/undo-element.abstract';
import { NOT_FOUND } from '@common/utils/env';
import { Vector2 } from '@common/vector2';

export class RectangleTool extends AbstractTool {
    use(context: CanvasRenderingContext2D, event: MouseEvent): void {
        const lastAction = this.actionsContainer.undoActions[this.actionsContainer.undoActions.length - 1];

        let width = event.offsetX - this.actionsContainer.initialPosition.x;
        let height = event.offsetY - this.actionsContainer.initialPosition.y;
        if (this.actionsContainer.previousRectangle) {
            context.clearRect(
                this.actionsContainer.initialPosition.x,
                this.actionsContainer.initialPosition.y,
                this.actionsContainer.previousRectangle.x - this.actionsContainer.initialPosition.x,
                this.actionsContainer.previousRectangle.y - this.actionsContainer.initialPosition.y,
            );
        }

        context.beginPath();
        if (event.shiftKey) {
            const size = Math.min(Math.abs(width), Math.abs(height));
            width = Math.sign(width) * size;
            height = Math.sign(height) * size;
        }
        context.fillRect(this.actionsContainer.initialPosition.x, this.actionsContainer.initialPosition.y, width, height);

        lastAction.pixels[1] = new Vector2(width + this.actionsContainer.initialPosition.x, height + this.actionsContainer.initialPosition.y);
        this.actionsContainer.previousRectangle = new Vector2(
            width + this.actionsContainer.initialPosition.x,
            height + this.actionsContainer.initialPosition.y,
        );
        const clearIndex = this.actionsContainer.undoActions.findIndex((element) => element instanceof ClearElement);
        const undoActionsCopy: UndoElement[] = clearIndex !== NOT_FOUND ? this.actionsContainer.undoActions.slice() : [];
        this.actionsContainer.undoActions = clearIndex !== NOT_FOUND ? undoActionsCopy.slice(clearIndex) : this.actionsContainer.undoActions;
        for (const action of this.actionsContainer.undoActions) {
            if (
                action.isLeftCanvas === this.actionsContainer.undoActions[this.actionsContainer.undoActions.length - 1].isLeftCanvas &&
                !(action instanceof SwitchElement || action instanceof ClearElement)
            ) {
                action.applyElementAction(context);
            }
            if (action instanceof ClearElement) {
                action.clear(context);
            }
        }
        this.actionsContainer.undoActions = clearIndex !== NOT_FOUND ? undoActionsCopy : this.actionsContainer.undoActions;
    }

    addUndoElementToActionsContainer(modifiedPixels: Vector2[], isLeftCanvas: boolean): void {
        this.actionsContainer.undoActions.push(
            new RectangleElement(modifiedPixels, isLeftCanvas, this.actionsContainer.penWidth, this.actionsContainer.color),
        );
    }
}
