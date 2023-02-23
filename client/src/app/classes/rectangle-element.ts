import { Vector2 } from '@common/vector2';
import { UndoElement } from './undo-element.abstract';

export class RectangleElement extends UndoElement {
    color: string = 'black';
    pixels: Vector2[];

    undoEvent(): void {
        throw new Error('Method not implemented.');
    }
    redoEvent(): void {
        throw new Error('Method not implemented.');
    }
    draw(context: CanvasRenderingContext2D): CanvasRenderingContext2D {
        context.beginPath();
        context.strokeStyle = this.color;
        context.fillStyle = this.color;
        context.moveTo(this.pixels[0].x, this.pixels[0].y);
        const rectStart = this.pixels[0];
        const rectEnd = this.pixels[1];

        context.fillRect(rectStart.x, rectStart.y, rectEnd.x - rectStart.x, rectEnd.y - rectStart.y);
        return context;
    }
}
