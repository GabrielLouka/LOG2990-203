import { RectangleElement } from '@app/classes/rectangle-element/rectangle-element';
import { UndoElement } from '@app/classes/undo-element-abstract/undo-element.abstract';
import { Vector2 } from '@common/vector2';
import { DuplicationElement } from './duplication-element';

describe('DuplicationElement', () => {
    it('should create an instance', () => {
        const duplicateCanvas = new DuplicationElement();
        expect(duplicateCanvas).toBeTruthy();
        const mockActions: UndoElement[] = [];
        mockActions.push(new RectangleElement([new Vector2(1, 2), new Vector2(3, 4)], 'black', false));

        duplicateCanvas.loadActions(mockActions);

        const tempCanvas = document.createElement('canvas');
        const tempContext = tempCanvas.getContext('2d') as CanvasRenderingContext2D;

        tempCanvas.width = 500;
        tempCanvas.height = 500;

        duplicateCanvas.draw(tempContext);
    });
});
