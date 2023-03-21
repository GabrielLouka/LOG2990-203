// import { RectangleTool } from './rectangle-tool';

// describe('RectangleTool', () => {
//     // it('should create an instance', () => {
//     //   expect(new RectangleTool()).toBeTruthy();
//     // });

//     it('should call use', () => {
//         const rectangleTool = new RectangleTool();
//         const context = new CanvasRenderingContext2D();
//         const event = new MouseEvent('click');
//         rectangleTool.use(context, event);
//     });

//     it('shoudl redo cleared pixels', () => {
//         const rectangleTool = new RectangleTool();
//         rectangleTool.redoClearedPixels();
//     });
// });

/* eslint-disable no-restricted-imports */
/* eslint-disable no-unused-vars */
import { ElementRef } from '@angular/core';
import { ActionsContainer } from '../actions-container/actions-container';
import { RectangleTool } from './rectangle.tool';

describe('EraserTool', () => {
    let actionsContainer: ActionsContainer;
    let leftCanvas: ElementRef<HTMLCanvasElement>;
    let rightCanvas: ElementRef<HTMLCanvasElement>;
    let rectangle: RectangleTool;
    // let contextMock: CanvasRenderingContext2D;
    beforeEach(() => {
        leftCanvas = { nativeElement: document.createElement('canvas') };
        rightCanvas = { nativeElement: document.createElement('canvas') };
        actionsContainer = new ActionsContainer(leftCanvas, rightCanvas);
        rectangle = new RectangleTool(actionsContainer);
        // contextMock = jasmine.createSpyObj('CanvasRenderingContext2D', ['beginPath', 'moveTo', 'lineTo', 'stroke']);
        rectangle.actionsContainer.undoActions = [];
    });

    it('should create', () => {
        expect(rectangle).toBeTruthy();
    });

    it('should call use', () => {
        const context = new CanvasRenderingContext2D();
        const event = new MouseEvent('click');
        rectangle.use(context, event);
    });

    it('should redo cleared pixels', () => {
        rectangle.redoClearedPixels();
    });

    describe('addUndoElementToActionsContainer', () => {
        it('should add a new Rectangle to the undoActions array of the actionsContainer', () => {
            const modifiedPixelsMock = [jasmine.createSpyObj('Vector2', ['x', 'y'])];
            const isLeftCanvasMock = true;
            rectangle.actionsContainer.undoActions = [];

            rectangle.addUndoElementToActionsContainer(modifiedPixelsMock, isLeftCanvasMock);
        });
    });

    describe('redoClearedPixels', () => {
        it('should redo cleared pixels', () => {
            rectangle.redoClearedPixels();
        });
    });
});
