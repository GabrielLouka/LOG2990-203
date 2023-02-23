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
    tempCanvas: HTMLCanvasElement;
    tempContext: CanvasRenderingContext2D;
    context: CanvasRenderingContext2D;
    color: string = 'black';
    selectedTool: Tool;
    initialPosition: Vector2;
    constructor(public canvas: ElementRef<HTMLCanvasElement>, public palette: ElementRef<HTMLDivElement>) {
        this.tempCanvas = canvas.nativeElement;
        this.context = canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.tempContext = this.tempCanvas.getContext('2d') as CanvasRenderingContext2D;
        this.tempCanvas.width = canvas.nativeElement.width;
        this.tempCanvas.height = canvas.nativeElement.height;
        this.setupListeners();
        // this.selectedTool = Tool.CRAYON;
    }

    undo() {
        this.tempContext.clearRect(0, 0, this.tempCanvas.width, this.tempCanvas.height);
        (this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D).clearRect(
            0,
            0,
            this.canvas.nativeElement.width,
            this.canvas.nativeElement.height,
        );
        // Redraw all the previous strokes onto the temporary canvas
        for (let i = 0; i < this.undoActions.length - 1; i++) {
            this.tempContext.beginPath();
            this.tempContext.strokeStyle = this.undoActions[i].color;
            if (this.undoActions[i] instanceof RectangleElement) {
                const rectStart = this.undoActions[i].pixels[0];
                const rectEnd = this.undoActions[i].pixels[1];
                this.tempContext.fillRect(rectStart.x, rectStart.y, rectStart.x - rectEnd.x, rectStart.y - rectEnd.y);
            } else {
                const stroke = this.undoActions[i].pixels;
                this.tempContext.moveTo(stroke[0].x, stroke[0].y);
                for (let j = 1; j < stroke.length; j++) {
                    this.tempContext.lineTo(stroke[j].x, stroke[j].y);
                }
                this.tempContext.stroke();
            }
        }
        // Update the actions array to remove the most recent stroke
        this.redoActions.push(this.undoActions.pop() as UndoElement);
    }
    redo() {
        const lastRedoAction = this.redoActions.pop();
        if (lastRedoAction) {
            this.undoActions.push(lastRedoAction);
            for (const action of this.undoActions) {
                this.context.beginPath();
                this.context.moveTo(action.pixels[0].x, action.pixels[0].y);
                this.context.strokeStyle = action.color;
                for (const pixel of action.pixels) {
                    this.context.lineTo(pixel.x, pixel.y);
                    this.context.stroke();
                }
            }
        }
    }
    setupListeners() {
        this.canvas.nativeElement.addEventListener('mousedown', (event) => {
            this.context.beginPath();
            this.initialPosition = new Vector2(event.offsetX, event.offsetY);
            this.context.moveTo(event.offsetX, event.offsetY);
            this.context.strokeStyle = this.color;
            const modifiedPixels: Vector2[] = [];
            this.undoActions.push(new CrayonElement(modifiedPixels, this.color));
            this.canvas.nativeElement.addEventListener('mousemove', this.draw);
        });

        this.canvas.nativeElement.addEventListener('mouseup', () => {
            this.canvas.nativeElement.removeEventListener('mousemove', this.draw);
            if (this.selectedTool === Tool.RECTANGLE) {
            }
        });

        this.canvas.nativeElement.addEventListener('mouseout', () => {
            this.canvas.nativeElement.removeEventListener('mousemove', this.draw);
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
            this.context.lineTo(event.offsetX, event.offsetY);
            this.context.stroke();
            this.undoActions[this.undoActions.length - 1].pixels.push(new Vector2(event.offsetX, event.offsetY));
        } else if (this.selectedTool === Tool.RECTANGLE) {
            // this.tempContext.clearRect(0, 0, this.tempCanvas.width, this.tempCanvas.height);
            //this.tempContext.beginPath();
            const x1 = Math.min(this.initialPosition.x, event.offsetX);
            const y1 = Math.min(this.initialPosition.y, event.offsetY);
            const x2 = Math.max(this.initialPosition.x, event.offsetX);
            const y2 = Math.max(this.initialPosition.y, event.offsetY);
        
            // Draw the rectangle onto the temporary canvas
            this.tempContext.beginPath();
            this.tempContext.fillStyle = this.color;
            this.tempContext.fillRect(x1, y1, x2 - x1, y2 - y1);
        }
    };
}
