import { UndoElement } from './undo-element.abstract';

export class CrayonElement extends UndoElement {
    draw(context: CanvasRenderingContext2D): CanvasRenderingContext2D {
        context.beginPath();
        context.strokeStyle = this.color;
        context.lineWidth = this.penWidth;

        context.lineCap = 'round';

        const stroke = this.pixels;
        for (let j = 1; j < stroke.length; j++) {
            const point = stroke[j];
            context.moveTo(point.x, point.y);
            context.lineTo(stroke[j].x, stroke[j].y);
        }
        context.stroke();

        return context;
    }
}
