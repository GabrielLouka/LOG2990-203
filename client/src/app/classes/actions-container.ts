import { ElementRef } from '@angular/core';
import { Vector2 } from '@common/vector2';
import { CrayonElement } from './crayon-element';
import { RectangleElement } from './rectangle-element';
import { UndoElement } from './undo-element.abstract';
export enum Tool {
    CRAYON = 'crayon',
    RECTANGLE = 'rectangle',
    ERASER = 'eraser',
}

export class ActionsContainer {
    undoActions: UndoElement[] = [];
    redoActions: UndoElement[] = [];
    context: CanvasRenderingContext2D;
    color: string = 'black';
    selectedTool: Tool;
    initialPosition: Vector2;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    previousRectangle: Vector2;
    constructor(public canvas: ElementRef<HTMLCanvasElement>, public palette: ElementRef<HTMLDivElement>) {
        this.context = canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.setupListeners();
        this.selectedTool = Tool.CRAYON;
    }

    undo() {
        this.context.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
        // Redraw all the previous strokes onto the canvas
        for (let i = 0; i < this.undoActions.length - 1; i++) {
            this.undoActions[i].draw(this.context);
        }
        // Update the actions array to remove the most recent stroke
        this.redoActions.push(this.undoActions.pop() as UndoElement);
    }
    redo() {
        const lastRedoAction = this.redoActions.pop();
        if (lastRedoAction) {
            this.undoActions.push(lastRedoAction);
            for (const action of this.undoActions) {
                action.draw(this.context);
            }
        }
    }
    setupListeners() {
        this.canvas.nativeElement.addEventListener('mousedown', (event) => {
            this.initialPosition = new Vector2(event.offsetX, event.offsetY);
            const modifiedPixels: Vector2[] = [];
            modifiedPixels.push(this.initialPosition);
            if (this.selectedTool === Tool.CRAYON) {
                this.undoActions.push(new CrayonElement(modifiedPixels, this.color));
            } else if (this.selectedTool === Tool.RECTANGLE) {
                this.undoActions.push(new RectangleElement(modifiedPixels, this.color));
            }
            this.canvas.nativeElement.addEventListener('mousemove', this.draw);
        });

        this.canvas.nativeElement.addEventListener('mouseup', () => {
            this.canvas.nativeElement.removeEventListener('mousemove', this.draw);
            if (this.selectedTool === Tool.RECTANGLE) {
                this.undoActions[this.undoActions.length - 1].pixels[1] = new Vector2(this.previousRectangle.x, this.previousRectangle.y);
                this.undoActions[this.undoActions.length - 1].draw(this.context);
            }
            this.redoActions = [];
        });

        this.canvas.nativeElement.addEventListener('mouseout', () => {
            this.canvas.nativeElement.removeEventListener('mousemove', this.draw);
            if (this.selectedTool === Tool.RECTANGLE) {
                this.undoActions[this.undoActions.length - 1].pixels[1] = new Vector2(this.previousRectangle.x, this.previousRectangle.y);
                this.undoActions[this.undoActions.length - 1].draw(this.context);
            }
            this.redoActions = [];
        });

        const swatches = this.palette.nativeElement.querySelectorAll('.swatch');
        swatches.forEach((swatch) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            swatch.addEventListener('click', (event: any) => {
                this.color = event.target.style.backgroundColor;
            });
        });
    }

    draw = (event: MouseEvent) => {
        if (this.selectedTool === Tool.CRAYON) {
            this.undoActions[this.undoActions.length - 1].pixels.push(new Vector2(event.offsetX, event.offsetY));
            this.undoActions[this.undoActions.length - 1].draw(this.context);
        } else if (this.selectedTool === Tool.RECTANGLE) {
            const x2 = event.offsetX;
            const y2 = event.offsetY;

            // Clear the previous rectangle
            if (this.previousRectangle) {
                this.context.clearRect(
                    this.initialPosition.x,
                    this.initialPosition.y,
                    this.previousRectangle.x - this.initialPosition.x,
                    this.previousRectangle.y - this.initialPosition.y,
                );
            }
            this.undoActions[this.undoActions.length - 1].pixels[1] = new Vector2(x2, y2);
            this.undoActions[this.undoActions.length - 1].color = this.color;

            this.context.beginPath();
            this.context.fillRect(
                this.initialPosition.x,
                this.initialPosition.y,
                event.offsetX - this.initialPosition.x,
                event.offsetY - this.initialPosition.y,
            );

            // Store the current rectangle for next time and redraw the previous strokes ()
            this.previousRectangle = new Vector2(x2, y2);
            for (const action of this.undoActions) {
                action.draw(this.context);
            }
        }
    };
}
