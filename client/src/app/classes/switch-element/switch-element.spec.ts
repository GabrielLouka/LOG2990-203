import { RectangleElement } from '@app/classes/rectangle-element/rectangle-element';
import { UndoElement } from '@app/classes/undo-element-abstract/undo-element.abstract';
import { Vector2 } from '@common/vector2';
import { SwitchElement } from './switch-element';

describe('SwitchElement', () => {
    it('should create an instance', () => {
        const switchElement = new SwitchElement();
        expect(switchElement).toBeTruthy();
        const mockActions: UndoElement[] = [];
        mockActions.push(new RectangleElement([new Vector2(1, 2), new Vector2(3, 4)], 'black', false));
        const leftCanvas = { nativeElement: document.createElement('canvas') };
        const rightCanvas = { nativeElement: document.createElement('canvas') };

        switchElement.loadCanvases(
            mockActions,
            leftCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D,
            rightCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D,
        );
        switchElement.draw(leftCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D);
    });
});
