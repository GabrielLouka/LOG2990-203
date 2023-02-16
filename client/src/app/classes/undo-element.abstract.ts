export abstract class UndoElement {
    abstract undoEvent(): void;
    abstract redoEvent(): void;
}
