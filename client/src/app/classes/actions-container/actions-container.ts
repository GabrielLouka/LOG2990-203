import { ElementRef } from '@angular/core';
import { ClearElement } from '@app/classes/clear-element/clear-element';
import { CrayonElement } from '@app/classes/crayon-element/crayon-element';
import { EraserElement } from '@app/classes/eraser-element/eraser-element';
import { RectangleElement } from '@app/classes/rectangle-element/rectangle-element';
import { SwitchElement } from '@app/classes/switch-element/switch-element';
import { UndoElement } from '@app/classes/undo-element-abstract/undo-element.abstract';
import { NOT_FOUND, PEN_WIDTH } from '@common/utils/env';
import { Vector2 } from '@common/vector2';
export enum Tool {
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
    penWidth: number = PEN_WIDTH;
    selectedTool: Tool;
    initialPosition: Vector2;
    previousRectangle: Vector2;

    constructor(public leftDrawingCanvas: ElementRef<HTMLCanvasElement>, public rightDrawingCanvas: ElementRef<HTMLCanvasElement>) {
        this.leftContext = leftDrawingCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.rightContext = rightDrawingCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.setupListeners();
        this.selectedTool = Tool.NONE;
    }

    undo() {
        let activeContext;

        this.leftContext.clearRect(0, 0, this.leftDrawingCanvas.nativeElement.width, this.leftDrawingCanvas.nativeElement.height);
        this.rightContext.clearRect(0, 0, this.leftDrawingCanvas.nativeElement.width, this.leftDrawingCanvas.nativeElement.height);
        const maxIndex = this.undoActions.length - 1;
        for (let i = 0; i <= maxIndex; i++) {
            if (this.undoActions[i].isLeftCanvas) {
                activeContext = this.leftContext;
            } else {
                activeContext = this.rightContext;
            }
            this.undoActions[i].draw(activeContext);
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
                    action.draw(activeContext);
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
        let activeContext: CanvasRenderingContext2D;
        if (this.undoActions[this.undoActions.length - 1].isLeftCanvas) {
            activeContext = this.leftContext;
        } else {
            activeContext = this.rightContext;
        }
        switch (this.selectedTool) {
            case Tool.ERASER:
            case Tool.CRAYON: {
                this.undoActions[this.undoActions.length - 1].pixels.push(new Vector2(event.offsetX, event.offsetY));
                this.undoActions[this.undoActions.length - 1].draw(activeContext);
                break;
            }
            case Tool.RECTANGLE: {
                let width = event.offsetX - this.initialPosition.x;
                let height = event.offsetY - this.initialPosition.y;
                if (this.previousRectangle) {
                    activeContext.clearRect(
                        this.initialPosition.x,
                        this.initialPosition.y,
                        this.previousRectangle.x - this.initialPosition.x,
                        this.previousRectangle.y - this.initialPosition.y,
                    );
                }

                activeContext.beginPath();
                if (event.shiftKey) {
                    const size = Math.min(Math.abs(width), Math.abs(height));
                    width = Math.sign(width) * size;
                    height = Math.sign(height) * size;
                }
                activeContext.fillRect(this.initialPosition.x, this.initialPosition.y, width, height);

                this.undoActions[this.undoActions.length - 1].pixels[1] = new Vector2(
                    width + this.initialPosition.x,
                    height + this.initialPosition.y,
                );
                this.previousRectangle = new Vector2(width + this.initialPosition.x, height + this.initialPosition.y);
                const clearIndex = this.undoActions.findIndex((element) => element instanceof ClearElement);
                const undoActionsCopy: UndoElement[] = clearIndex !== NOT_FOUND ? this.undoActions.slice() : [];
                this.undoActions = clearIndex !== NOT_FOUND ? undoActionsCopy.slice(clearIndex) : this.undoActions;
                for (const action of this.undoActions) {
                    if (
                        action.isLeftCanvas === this.undoActions[this.undoActions.length - 1].isLeftCanvas &&
                        !(action instanceof SwitchElement || action instanceof ClearElement)
                    ) {
                        action.draw(activeContext);
                    }
                    if (action instanceof ClearElement) {
                        action.clear(activeContext);
                    }
                }
                this.undoActions = clearIndex !== NOT_FOUND ? undoActionsCopy : this.undoActions;
                break;
            }
        }
    };

    handleMouseDown(canvas: HTMLCanvasElement, event: MouseEvent) {
        this.initialPosition = new Vector2(event.offsetX, event.offsetY);
        let currentCanvasIsLeft;
        if ((canvas.getContext('2d') as CanvasRenderingContext2D) === this.leftContext) {
            currentCanvasIsLeft = true;
        } else {
            currentCanvasIsLeft = false;
        }
        const modifiedPixels: Vector2[] = [];
        modifiedPixels.push(this.initialPosition);
        switch (this.selectedTool) {
            case Tool.CRAYON: {
                this.undoActions.push(new CrayonElement(modifiedPixels, currentCanvasIsLeft, this.penWidth, this.color));
                break;
            }
            case Tool.RECTANGLE: {
                this.undoActions.push(new RectangleElement(modifiedPixels, currentCanvasIsLeft, this.penWidth, this.color));
                break;
            }
            case Tool.ERASER: {
                this.undoActions.push(new EraserElement(modifiedPixels, currentCanvasIsLeft, this.penWidth));
                break;
            }
        }

        canvas.addEventListener('mousemove', this.draw);
    }

    handleMouseUpOrOut(canvas: HTMLCanvasElement) {
        canvas.removeEventListener('mousemove', this.draw);
        this.redoActions = [];
    }
}
