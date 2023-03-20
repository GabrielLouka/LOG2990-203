import { UndoElement } from '@app/classes/undo-element-abstract/undo-element.abstract';
import { Vector2 } from '@common/vector2';

export class CrayonElement extends UndoElement {
    applyElementAction(context: CanvasRenderingContext2D): CanvasRenderingContext2D {
        context.beginPath();
        context.strokeStyle = this.color;
        context.lineWidth = this.penWidth;

        context.lineCap = 'round';

        const stroke = this.pixels;
        if (stroke.length > 2) {
            // Calculate the distance between two consecutive points
            const pointDistance = (p1: Vector2, p2: Vector2) => Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);

            // Create additional points between two consecutive points based on their distance
            const smoothStroke = [stroke[0]];
            for (let i = 1; i < stroke.length; i++) {
                const prevPoint = stroke[i - 1];
                const currentPoint = stroke[i];
                const distance = pointDistance(prevPoint, currentPoint);
                const subDivisions = Math.max(Math.round(distance / 5), 1);
                for (let j = 0; j < subDivisions; j++) {
                    const point = {
                        x: prevPoint.x + (currentPoint.x - prevPoint.x) * (j / subDivisions),
                        y: prevPoint.y + (currentPoint.y - prevPoint.y) * (j / subDivisions),
                    };
                    smoothStroke.push(point);
                }
            }

            // Draw the smoothed stroke
            context.moveTo(smoothStroke[0].x, smoothStroke[0].y);
            for (let j = 1; j < smoothStroke.length; j++) {
                context.lineTo(smoothStroke[j].x, smoothStroke[j].y);
            }
        } else {
            context.moveTo(stroke[0].x, stroke[0].y);
            context.lineTo(stroke[1].x, stroke[1].y);
        }
        context.stroke();

        return context;
    }
}
