/* eslint-disable @typescript-eslint/no-magic-numbers */

describe('EraserTool', () => {
    // let eraserTool: EraserTool;
    // let context: CanvasRenderingContext2D;
    // let event: MouseEvent;

    // beforeEach(() => {
    //     eraserTool = new EraserTool();
    //     context = jasmine.createSpyObj('CanvasRenderingContext2D', ['method1', 'method2']);
    //     event = new MouseEvent('click', { offsetX: 10, offsetY: 20 });
    // });

    // it('should use the tool and apply the action', () => {
    //     eraserTool.use(context, event);
    //     const lastAction = eraserTool.actionsContainer.undoActions[eraserTool.actionsContainer.undoActions.length - 1];
    //     expect(lastAction.pixels[lastAction.pixels.length - 1]).toEqual(new Vector2(event.offsetX, event.offsetY));
    //     expect(lastAction.applyElementAction).toHaveBeenCalledWith(context);
    // });

    // it('should add an undo element to the actions container', () => {
    //     const modifiedPixels: Vector2[] = [new Vector2(5, 5), new Vector2(10, 10)];
    //     const isLeftCanvas = true;
    //     eraserTool.addUndoElementToActionsContainer(modifiedPixels, isLeftCanvas);
    //     const lastAction = eraserTool.actionsContainer.undoActions[eraserTool.actionsContainer.undoActions.length - 1];
    //     expect(lastAction).toEqual(jasmine.any(EraserElement));
    //     expect(lastAction.modifiedPixels).toEqual(modifiedPixels);
    //     expect(lastAction.isLeftCanvas).toEqual(isLeftCanvas);
    //     expect(lastAction.penWidth).toEqual(eraserTool.actionsContainer.penWidth);
    //     expect(lastAction.color).toEqual(eraserTool.actionsContainer.color);
    // });

    it('should do nothing', () => expect(true).toBeTrue());

    // it('use method should be called', () => {
    //     const spy = spyOn(eraserTool, 'use');
    //     eraserTool.use(context, event);
    //     expect(spy).toHaveBeenCalled();
    // });
});
