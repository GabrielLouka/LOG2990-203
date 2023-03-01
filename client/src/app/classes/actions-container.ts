import { ElementRef } from '@angular/core';
import { Vector2 } from '@common/vector2';
import { ClearElement } from './clear-element';
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
    selectedTool: Tool;
    initialPosition: Vector2;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    previousRectangle: Vector2;
    constructor(
        public leftCanvas: ElementRef<HTMLCanvasElement>,
        public rightCanvas: ElementRef<HTMLCanvasElement>,
        public palette: ElementRef<HTMLDivElement>,
    ) {
        this.leftContext = leftCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.rightContext = rightCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.setupListeners();
        this.selectedTool = Tool.CRAYON;
    }
    undo() {
        let activeContext;

        this.leftContext.clearRect(0, 0, this.leftCanvas.nativeElement.width, this.leftCanvas.nativeElement.height);
        this.rightContext.clearRect(0, 0, this.leftCanvas.nativeElement.width, this.leftCanvas.nativeElement.height);
        // Redraw all the previous strokes onto the canvas
        // const containsClear = this.undoActions.some((element) => element instanceof ClearElement);
        const maxIndex = this.undoActions.length - 1;
        // if (containsClear) {
        //     maxIndex = this.undoActions.length;
        // }
        for (let i = 0; i < maxIndex; i++) {
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
                if (!(action instanceof ClearElement)) {
                    action.draw(activeContext);
                } else {
                    action.clear(activeContext);
                }
            }
        }
    }

    setupListeners() {
        this.leftCanvas.nativeElement.addEventListener('mousedown', this.handleMouseDown.bind(this, this.leftCanvas.nativeElement));
        this.leftCanvas.nativeElement.addEventListener('mouseup', this.handleMouseUpOrOut.bind(this, this.leftCanvas.nativeElement));
        this.leftCanvas.nativeElement.addEventListener('mouseout', this.handleMouseUpOrOut.bind(this, this.leftCanvas.nativeElement));
        this.rightCanvas.nativeElement.addEventListener('mousedown', this.handleMouseDown.bind(this, this.rightCanvas.nativeElement));
        this.rightCanvas.nativeElement.addEventListener('mouseup', this.handleMouseUpOrOut.bind(this, this.rightCanvas.nativeElement));
        this.rightCanvas.nativeElement.addEventListener('mouseout', this.handleMouseUpOrOut.bind(this, this.rightCanvas.nativeElement));
        const swatches = this.palette.nativeElement.querySelectorAll('.swatch');
        swatches.forEach((swatch) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            swatch.addEventListener('click', (event: any) => {
                this.color = event.target.style.backgroundColor;
            });
        });
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
                // Clear the previous rectangle
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

                // Store the current rectangle for next time and redraw the previous strokes
                this.undoActions[this.undoActions.length - 1].pixels[1] = new Vector2(
                    width + this.initialPosition.x,
                    height + this.initialPosition.y,
                );
                this.previousRectangle = new Vector2(width + this.initialPosition.x, height + this.initialPosition.y);
                const clearIndex = this.undoActions.findIndex((element) => element instanceof ClearElement);
                const undoActionsCopy: UndoElement[] = clearIndex !== -1 ? this.undoActions.slice() : [];
                this.undoActions = clearIndex !== -1 ? undoActionsCopy.slice(clearIndex) : this.undoActions;
                for (const action of this.undoActions) {
                    if (
                        action.isLeftCanvas === this.undoActions[this.undoActions.length - 1].isLeftCanvas &&
                        !(action instanceof SwitchElement || action instanceof ClearElement)
                    ) {
                        action.draw(activeContext);
                    }
                }
                this.undoActions = clearIndex !== -1 ? undoActionsCopy : this.undoActions;
                break;
            }
            // No default
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
                this.undoActions.push(new CrayonElement(modifiedPixels, this.color, currentCanvasIsLeft));
                break;
            }
            case Tool.RECTANGLE: {
                this.undoActions.push(new RectangleElement(modifiedPixels, this.color, currentCanvasIsLeft));
                break;
            }
            case Tool.ERASER: {
                this.undoActions.push(new EraserElement(modifiedPixels, 'white', currentCanvasIsLeft));
                break;
            }
        }

        canvas.addEventListener('mousemove', this.draw);
    }

    // eslint-disable-next-line no-unused-vars
    handleMouseUpOrOut(canvas: HTMLCanvasElement, event: MouseEvent) {
        canvas.removeEventListener('mousemove', this.draw);
        // if (this.selectedTool === Tool.RECTANGLE) {
        //     this.undoActions[this.undoActions.length - 1].pixels[1] = new Vector2(this.previousRectangle.x, this.previousRectangle.y);
        // }
        this.redoActions = [];
    }
}
