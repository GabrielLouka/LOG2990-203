import { UndoElement } from './undo-element.abstract';

export class CrayonElement extends UndoElement {
    undoEvent(): void {
        throw new Error('Method not implemented.');
    }
    redoEvent(): void {
        throw new Error('Method not implemented.');
    }
    draw(context: CanvasRenderingContext2D): CanvasRenderingContext2D {
        context.beginPath();
        context.strokeStyle = this.color;
        context.moveTo(this.pixels[0].x, this.pixels[0].y);
        const stroke = this.pixels;
        for (let j = 1; j < stroke.length; j++) {
            context.lineTo(stroke[j].x, stroke[j].y);
        }
        context.stroke();
        return context;
    }
}
