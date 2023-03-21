/* eslint-disable @typescript-eslint/no-magic-numbers */
import { DuplicationElement } from './duplication-element';

describe('DuplicationElement', () => {
    it('should create an instance', () => {
        const duplicateCanvas = new DuplicationElement();
        expect(duplicateCanvas).toBeTruthy();
        // const mockActions: UndoElement[] = [];
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        // mockActions.push(new RectangleElement([new Vector2(1, 2), new Vector2(3, 4)], false));

        const tempCanvas = document.createElement('canvas');
        const tempContext = tempCanvas.getContext('2d') as CanvasRenderingContext2D;

        tempCanvas.width = 500;
        tempCanvas.height = 500;

        duplicateCanvas.applyElementAction(tempContext);
    });

    it('should load canvases', () => {
        const duplicateCanvas = new DuplicationElement();
        const tempCanvas = document.createElement('canvas');
        const tempContext = tempCanvas.getContext('2d') as CanvasRenderingContext2D;

        tempCanvas.width = 500;
        tempCanvas.height = 500;

        duplicateCanvas.loadCanvases(tempContext, tempContext);
    });

    it('temp canvas should have the same size as the source canvas', () => {
        const duplicateCanvas = new DuplicationElement();
        const tempCanvas = document.createElement('canvas');
        const tempContext = tempCanvas.getContext('2d') as CanvasRenderingContext2D;

        tempCanvas.width = 500;
        tempCanvas.height = 500;

        duplicateCanvas.loadCanvases(tempContext, tempContext);
        duplicateCanvas.applyElementAction(tempContext);
        expect(tempCanvas.width).toEqual(500);
        expect(tempCanvas.height).toEqual(500);
    });
});
