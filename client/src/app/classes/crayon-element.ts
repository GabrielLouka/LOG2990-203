import { ElementRef, OnInit, ViewChild } from '@angular/core';
import { UndoElement } from './undo-element.abstract';

export class CrayonElement extends UndoElement implements OnInit {
    canvas: ElementRef<HTMLCanvasElement>;

    context: CanvasRenderingContext2D;

    setupListeners() {
        this.canvas.nativeElement.addEventListener('mousedown', (event) => {
            this.context.beginPath();
            this.context.moveTo(event.offsetX, event.offsetY);
            this.canvas.nativeElement.addEventListener('mousemove', this.draw);
        });

        this.canvas.nativeElement.addEventListener('mouseup', () => {
            this.canvas.nativeElement.removeEventListener('mousemove', this.draw);
        });

        this.canvas.nativeElement.addEventListener('mouseout', () => {
            this.canvas.nativeElement.removeEventListener('mousemove', this.draw);
        });
    }

    draw = (event: MouseEvent) => {
        this.context.lineTo(event.offsetX, event.offsetY);
        this.context.stroke();
    };
    undoEvent(): void {
        throw new Error('Method not implemented.');
    }
    redoEvent(): void {
        throw new Error('Method not implemented.');
    }
}
