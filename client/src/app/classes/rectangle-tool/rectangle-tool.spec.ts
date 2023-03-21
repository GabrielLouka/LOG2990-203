/* eslint-disable no-restricted-imports */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { ElementRef } from '@angular/core';
import { ActionsContainer } from '../actions-container/actions-container';
import { RectangleTool } from './rectangle-tool';

describe('RectangleTool', () => {
    let actionsContainer: ActionsContainer;
    let leftCanvas: ElementRef<HTMLCanvasElement>;
    let rightCanvas: ElementRef<HTMLCanvasElement>;
    let rectangleTool: RectangleTool;
    let contextMock: CanvasRenderingContext2D;
    beforeEach(() => {
        leftCanvas = { nativeElement: document.createElement('canvas') };
        rightCanvas = { nativeElement: document.createElement('canvas') };
        actionsContainer = new ActionsContainer(leftCanvas, rightCanvas);
        rectangleTool = new RectangleTool(actionsContainer);
        contextMock = jasmine.createSpyObj('CanvasRenderingContext2D', ['beginPath', 'moveTo', 'lineTo', 'stroke']);
        rectangleTool.actionsContainer.undoActions = [];
    });

    it('should create an instance', () => {
        expect(rectangleTool).toBeTruthy();
    });

    it('should add new Vector2 to the pixels array of the last action and apply the action', () => {
        const eventMock = {
            offsetX: 100,
            offsetY: 200,
        };
        const lastAction = jasmine.createSpyObj('EraserElement', ['applyElementAction', 'pixels']);
        rectangleTool.actionsContainer.undoActions.push(lastAction);
        lastAction.pixels = [{ x: 100, y: 200 }];
        lastAction.applyElementAction.and.callFake(() => {
            return;
        });
        rectangleTool.use(contextMock, new MouseEvent('click'));
        expect(lastAction.pixels[0].x).toEqual(eventMock.offsetX);
        expect(lastAction.pixels[0].y).toEqual(eventMock.offsetY);
    });

    describe('addUndoElementToActionsContainer', () => {
        it('should add a new Rectangle to the undoActions array of the actionsContainer', () => {
            const modifiedPixelsMock = [jasmine.createSpyObj('Vector2', ['x', 'y'])];
            const isLeftCanvasMock = true;
            rectangleTool.actionsContainer.undoActions = [];

            rectangleTool.addUndoElementToActionsContainer(modifiedPixelsMock, isLeftCanvasMock);
        });
    });

    describe('redoClearedPixels', () => {
        it('should redo cleared pixels', () => {
            rectangleTool.redoClearedPixels();
        });
    });
});
