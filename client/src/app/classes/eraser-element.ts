import { UndoElement } from './undo-element.abstract';

export class EraserElement extends UndoElement {
    draw(context: CanvasRenderingContext2D): CanvasRenderingContext2D {
        context.beginPath();

        context.lineWidth = this.penWidth;
        context.lineCap = 'butt';

        context.moveTo(this.pixels[0].x, this.pixels[0].y);
        const stroke = this.pixels;
        for (let j = 1; j < stroke.length; j++) {
            context.clearRect(stroke[j].x - this.penWidth / 2, stroke[j].y - this.penWidth / 2, this.penWidth, this.penWidth);
        }
        context.stroke();
        return context;
    }
}
