import { ElementRef } from '@angular/core';
import { AbstractTool } from '@app/classes/abstract-tool/abstract.tool';
import { ClearElement } from '@app/classes/clear-element/clear-element';
import { EraserTool } from '@app/classes/eraser-tool/eraser.tool';
import { PencilTool } from '@app/classes/pencil-tool/pencil.tool';
import { RectangleTool } from '@app/classes/rectangle-tool/rectangle.tool';
import { SwitchElement } from '@app/classes/switch-element/switch-element';
import { UndoElement } from '@app/classes/undo-element-abstract/undo-element.abstract';
import { PEN_WIDTH } from '@common/utils/env';
import { Vector2 } from '@common/vector2';
export enum ToolType {
    CRAYON = 'crayon',
    RECTANGLE = 'rectangle',
    ERASER = 'eraser',
    NONE = 'none',
}

export class ActionsContainer {
    undoActions: UndoElement[] = [];
    redoActions: UndoElement[] = [];
    leftContext: CanvasRenderingContext2D;
    rightContext: CanvasRenderingContext2D;
    currentCanvasIsLeft: boolean;
    color: string = 'black';
    currentToolObject: AbstractTool | null = null;
    initialPosition: Vector2;
    previousRectangle: Vector2;
    penWidth: number = PEN_WIDTH;
    constructor(public leftDrawingCanvas: ElementRef<HTMLCanvasElement>, public rightDrawingCanvas: ElementRef<HTMLCanvasElement>) {
        this.leftContext = leftDrawingCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.rightContext = rightDrawingCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.setupListeners();
    }

    get selectedToolType(): ToolType {
        if (this.currentToolObject instanceof PencilTool) {
            return ToolType.CRAYON;
        } else if (this.currentToolObject instanceof RectangleTool) {
            return ToolType.RECTANGLE;
        } else if (this.currentToolObject instanceof EraserTool) {
            return ToolType.ERASER;
        } else {
            return ToolType.NONE;
        }
    }

    selectTool(tool: ToolType) {
        switch (tool) {
            case ToolType.CRAYON: {
                this.currentToolObject = new PencilTool(this);

                break;
            }
            case ToolType.RECTANGLE: {
                this.currentToolObject = new RectangleTool(this);
                break;
            }
            case ToolType.ERASER: {
                this.currentToolObject = new EraserTool(this);
                break;
            }
            default:
                this.currentToolObject = null;
                break;
        }
    }

    undo() {
        let activeContext;

        this.leftContext.clearRect(0, 0, this.leftDrawingCanvas.nativeElement.width, this.leftDrawingCanvas.nativeElement.height);
        this.rightContext.clearRect(0, 0, this.leftDrawingCanvas.nativeElement.width, this.leftDrawingCanvas.nativeElement.height);
        const maxIndex = this.undoActions.length - 1;
        for (let i = 0; i <= maxIndex; i++) {
            activeContext = this.undoActions[i].isLeftCanvas ? this.leftContext : this.rightContext;
            this.undoActions[i].applyElementAction(activeContext);
        }
        this.redoActions.push(this.undoActions.pop() as UndoElement);
    }

    redo() {
        let activeContext;
        const lastRedoAction = this.redoActions.pop();
        if (lastRedoAction) {
            this.undoActions.push(lastRedoAction);
            for (const action of this.undoActions) {
                if (action.isLeftCanvas || action instanceof SwitchElement) {
                    activeContext = this.leftContext;
                } else {
                    activeContext = this.rightContext;
                }
                if (!(action instanceof ClearElement)) {
                    action.applyElementAction(activeContext);
                } else {
                    action.clear(activeContext);
                }
            }
        }
    }

    setupListeners() {
        this.leftDrawingCanvas.nativeElement.addEventListener('mousedown', this.handleMouseDown.bind(this, this.leftDrawingCanvas.nativeElement));
        this.leftDrawingCanvas.nativeElement.addEventListener('mouseup', this.handleMouseUpOrOut.bind(this, this.leftDrawingCanvas.nativeElement));
        this.rightDrawingCanvas.nativeElement.addEventListener('mousedown', this.handleMouseDown.bind(this, this.rightDrawingCanvas.nativeElement));
        this.rightDrawingCanvas.nativeElement.addEventListener('mouseup', this.handleMouseUpOrOut.bind(this, this.rightDrawingCanvas.nativeElement));
    }

    draw = (event: MouseEvent) => {
        const activeContext = this.undoActions[this.undoActions.length - 1].isLeftCanvas ? this.leftContext : this.rightContext;

        if (this.currentToolObject) {
            this.currentToolObject.use(activeContext, event);
        }
    };

    handleMouseDown(canvas: HTMLCanvasElement, event: MouseEvent) {
        this.initialPosition = new Vector2(event.offsetX, event.offsetY);
        const currentCanvasIsLeft = (canvas.getContext('2d') as CanvasRenderingContext2D) === this.leftContext;
        const modifiedPixels: Vector2[] = [];
        modifiedPixels.push(this.initialPosition);
        if (this.currentToolObject) {
            this.currentToolObject.addUndoElementToActionsContainer(modifiedPixels, currentCanvasIsLeft);
        }

        canvas.addEventListener('mousemove', this.draw);
    }

    handleMouseUpOrOut(canvas: HTMLCanvasElement) {
        canvas.removeEventListener('mousemove', this.draw);
        this.redoActions = [];
    }
}
