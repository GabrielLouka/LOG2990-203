import { UndoElement } from './undo-element.abstract';

export class CrayonElement extends UndoElement {
    undoEvent(): void {
        throw new Error('Method not implemented.');
    }
    redoEvent(): void {
        throw new Error('Method not implemented.');
    }
}
