/* eslint-disable @typescript-eslint/no-magic-numbers */
import { ElementRef } from '@angular/core';
import { Vector2 } from '@common/vector2';
import { CrayonElement } from './crayon-element';
import { EraserElement } from './eraser-element';
import { RectangleElement } from './rectangle-element';
import { SwitchElement } from './switch-element';
import { UndoElement } from './undo-element.abstract';
export enum Tool {
    CRAYON = 'crayon',
    RECTANGLE = 'rectangle',
    ERASER = 'eraser',
}

export class ActionsContainer {
    undoActions: UndoElement[] = [];
    redoActions: UndoElement[] = [];
    leftContext: CanvasRenderingContext2D;
    rightContext: CanvasRenderingContext2D;
    currentCanvasIsLeft: boolean;
    color: string = 'black';
    penWidth: number = 20;
    selectedTool: Tool;
    initialPosition: Vector2;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    previousRectangle: Vector2;
    constructor(
        public leftDrawingCanvas: ElementRef<HTMLCanvasElement>,
        public rightDrawingCanvas: ElementRef<HTMLCanvasElement>, // public palette: ElementRef<HTMLDivElement>,
    ) {
        this.leftContext = leftDrawingCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.rightContext = rightDrawingCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.setupListeners();
        // this.selectedTool = Tool.CRAYON;
    }
    undo() {
        let activeContext;

        this.leftContext.clearRect(0, 0, this.leftDrawingCanvas.nativeElement.width, this.leftDrawingCanvas.nativeElement.height);
        this.rightContext.clearRect(0, 0, this.leftDrawingCanvas.nativeElement.width, this.leftDrawingCanvas.nativeElement.height);
        // Redraw all the previous strokes onto the canvas
        for (let i = 0; i < this.undoActions.length - 1; i++) {
            if (this.undoActions[i].isLeftCanvas) {
                activeContext = this.leftContext;
            } else {
                activeContext = this.rightContext;
            }
            this.undoActions[i].draw(activeContext);
        }
        // Update the actions array to remove the most recent stroke
        this.redoActions.push(this.undoActions.pop() as UndoElement);
    }
    redo() {
        let activeContext;
        const lastRedoAction = this.redoActions.pop();
        if (lastRedoAction) {
            this.undoActions.push(lastRedoAction);
            for (const action of this.undoActions) {
                if (action.isLeftCanvas) {
                    activeContext = this.leftContext;
                } else {
                    activeContext = this.rightContext;
                }
                action.draw(activeContext);
            }
        }
    }

    setupListeners() {
        this.leftDrawingCanvas.nativeElement.addEventListener('mousedown', this.handleMouseDown.bind(this, this.leftDrawingCanvas.nativeElement));
        this.leftDrawingCanvas.nativeElement.addEventListener('mouseup', this.handleMouseUpOrOut.bind(this, this.leftDrawingCanvas.nativeElement));
        this.leftDrawingCanvas.nativeElement.addEventListener('mouseout', this.handleMouseUpOrOut.bind(this, this.leftDrawingCanvas.nativeElement));
        this.rightDrawingCanvas.nativeElement.addEventListener('mousedown', this.handleMouseDown.bind(this, this.rightDrawingCanvas.nativeElement));
        this.rightDrawingCanvas.nativeElement.addEventListener('mouseup', this.handleMouseUpOrOut.bind(this, this.rightDrawingCanvas.nativeElement));
        this.rightDrawingCanvas.nativeElement.addEventListener('mouseout', this.handleMouseUpOrOut.bind(this, this.rightDrawingCanvas.nativeElement));
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
                const x2 = event.offsetX;
                const y2 = event.offsetY;

                // Clear the previous rectangle
                if (this.previousRectangle) {
                    activeContext.clearRect(
                        this.initialPosition.x,
                        this.initialPosition.y,
                        this.previousRectangle.x - this.initialPosition.x,
                        this.previousRectangle.y - this.initialPosition.y,
                    );
                }

                this.undoActions[this.undoActions.length - 1].pixels[1] = new Vector2(x2, y2);

                activeContext.beginPath();
                activeContext.fillRect(
                    this.initialPosition.x,
                    this.initialPosition.y,
                    event.offsetX - this.initialPosition.x,
                    event.offsetY - this.initialPosition.y,
                );

                // Store the current rectangle for next time and redraw the previous strokes ()
                this.previousRectangle = new Vector2(x2, y2);
                for (const action of this.undoActions) {
                    if (action.isLeftCanvas === this.undoActions[this.undoActions.length - 1].isLeftCanvas && !(action instanceof SwitchElement)) {
                        action.draw(activeContext);
                    }
                }
                break;
            }
            // No default
        }
    };

    private handleMouseDown(canvas: HTMLCanvasElement, event: MouseEvent) {
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

    // eslint-disable-next-line no-unused-vars
    private handleMouseUpOrOut(canvas: HTMLCanvasElement, event: MouseEvent) {
        canvas.removeEventListener('mousemove', this.draw);
        if (this.selectedTool === Tool.RECTANGLE) {
            this.undoActions[this.undoActions.length - 1].pixels[1] = new Vector2(this.previousRectangle.x, this.previousRectangle.y);
        }
        this.redoActions = [];
    }
}
