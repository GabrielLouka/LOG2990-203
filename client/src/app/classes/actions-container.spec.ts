/* eslint-disable @typescript-eslint/no-magic-numbers */
import { ElementRef } from '@angular/core';
import { Vector2 } from '@common/vector2';
import { ActionsContainer, Tool } from './actions-container';
import { CrayonElement } from './crayon-element';
import { EraserElement } from './eraser-element';
import { RectangleElement } from './rectangle-element';

describe('ActionsContainer', () => {
    let actionsContainer: ActionsContainer;
    let leftCanvas: ElementRef<HTMLCanvasElement>;
    let rightCanvas: ElementRef<HTMLCanvasElement>;

    beforeEach(() => {
        leftCanvas = { nativeElement: document.createElement('canvas') };
        rightCanvas = { nativeElement: document.createElement('canvas') };
        actionsContainer = new ActionsContainer(leftCanvas, rightCanvas);
    });

    describe('constructor', () => {
        it('should set the left context and right context properties', () => {
            expect(actionsContainer.leftContext).toBeDefined();
            expect(actionsContainer.rightContext).toBeDefined();
        });

        it('should set the selectedTool property to Tool.CRAYON', () => {
            expect(actionsContainer.selectedTool).toEqual(Tool.CRAYON);
        });
    });

    describe('undo', () => {
        it('should redraw all previous strokes onto the canvas', () => {
            // Given
            actionsContainer.selectedTool = Tool.ERASER;
            actionsContainer.redoActions = [];
            actionsContainer.undoActions.push(new EraserElement([new Vector2(1, 2), new Vector2(3, 4)], false));
            actionsContainer.draw(new MouseEvent('mousemove'));
            actionsContainer.draw(new MouseEvent('mousedown'));
            actionsContainer.draw(new MouseEvent('mouseup'));

            actionsContainer.undoActions.push(new CrayonElement([new Vector2(1, 2), new Vector2(3, 4)], true));
            actionsContainer.draw(new MouseEvent('mouseup'));
            actionsContainer.undoActions.push(new CrayonElement([new Vector2(1, 2), new Vector2(3, 4)], false));
            actionsContainer.draw(new MouseEvent('mouseup'));
            // When
            actionsContainer.undo();
            actionsContainer.undo();
            actionsContainer.undo();

            // Then
            actionsContainer.redo();
            actionsContainer.redo();
            actionsContainer.redo();
        });

        it('should draw a rectangle with correct dimensions and clear previous rectangle', () => {
            actionsContainer.selectedTool = Tool.RECTANGLE;
            actionsContainer.undoActions.push(new RectangleElement([new Vector2(1, 2), new Vector2(3, 4)], false));

            actionsContainer.initialPosition = new Vector2(10, 10);
            actionsContainer.previousRectangle = new Vector2(20, 20);
            const mockEvent = new MouseEvent('click', {
                bubbles: true,
                offsetX: 30,
                offsetY: 30,
            } as MouseEventInit);

            actionsContainer.draw(mockEvent);
        });

        it('should draw a square when shift key is pressed', () => {
            actionsContainer.selectedTool = Tool.RECTANGLE;
            actionsContainer.undoActions.push(new RectangleElement([new Vector2(1, 2), new Vector2(3, 4)], false));
            actionsContainer.initialPosition = new Vector2(10, 10);
            const mockEvent = new MouseEvent('click', {
                bubbles: true,
                offsetX: 30,
                offsetY: 30,
                shiftKey: true,
            } as MouseEventInit);
            actionsContainer.draw(mockEvent);
        });

        it('should handle mousedown event on left or right canvas', () => {
            actionsContainer = new ActionsContainer(leftCanvas, rightCanvas);
            const mockEvent = new MouseEvent('mousedown', {
                bubbles: true,
                clientX: 10,
                clientY: 10,
            });
            actionsContainer.selectedTool = Tool.RECTANGLE;
            actionsContainer.leftDrawingCanvas.nativeElement.dispatchEvent(mockEvent);
            actionsContainer.rightDrawingCanvas.nativeElement.dispatchEvent(mockEvent);
            actionsContainer.selectedTool = Tool.CRAYON;
            actionsContainer.leftDrawingCanvas.nativeElement.dispatchEvent(mockEvent);
            actionsContainer.rightDrawingCanvas.nativeElement.dispatchEvent(mockEvent);
            actionsContainer.selectedTool = Tool.ERASER;
            actionsContainer.leftDrawingCanvas.nativeElement.dispatchEvent(mockEvent);
            actionsContainer.rightDrawingCanvas.nativeElement.dispatchEvent(mockEvent);
        });

        it('should handle mousedown event on left or right canvas', () => {
            const mockEvent = new MouseEvent('mouseup', {
                bubbles: true,
            });
            actionsContainer.selectedTool = Tool.RECTANGLE;
            actionsContainer.leftDrawingCanvas.nativeElement.dispatchEvent(mockEvent);
        });
    });
});
