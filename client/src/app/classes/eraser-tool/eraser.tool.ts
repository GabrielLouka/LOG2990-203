import { AbstractTool } from '@app/classes/abstract-tool/abstract.tool';
import { EraserElement } from '@app/classes/eraser-element/eraser-element';
import { Vector2 } from '@common/vector2';

export class EraserTool extends AbstractTool {
    use(): void {
        return;
    }

    addUndoElementToActionsContainer(modifiedPixels: Vector2[], isLeftCanvas: boolean): void {
        this.actionsContainer.undoActions.push(
            new EraserElement(modifiedPixels, isLeftCanvas, this.actionsContainer.penWidth, this.actionsContainer.color),
        );
    }
}
