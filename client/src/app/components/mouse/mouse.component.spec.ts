import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MouseComponent } from './mouse.component';

import SpyObj = jasmine.SpyObj;
import { MouseHandlerService } from '@app/services/mouse-handler.service';

describe('MouseComponent', () => {
    let mouseServiceSpy: SpyObj<MouseHandlerService>;
    let component: MouseComponent;
    let fixture: ComponentFixture<MouseComponent>;

    beforeEach(() => {
        // This is actually a Mock since we create a fake object that acts like a MouseHandlerService but does not use our real code
        // This can be helpful if we want to be sure that bugs in our dependency don't affect our component or if we have not written
        // the code of our dependency.
        mouseServiceSpy = jasmine.createSpyObj('MouseHandlerService', ['onMouseDown', 'onMouseUp']);
    });

    beforeEach(waitForAsync(() => {
        // We create our testing module and tell it to use our mouseServiceSpy as MouseHandlerService
        // Every class that has MouseHandlerService injected in it will now receive our Mock
        TestBed.configureTestingModule({
            declarations: [MouseComponent],
            providers: [{ provide: MouseHandlerService, useValue: mouseServiceSpy }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MouseComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Pushing the mouse button down should call onMouseDown in the service', () => {
        const mockClick = new MouseEvent('mousedown');

        component.onMouseDown(mockClick);
        expect(mouseServiceSpy.onMouseDown).toHaveBeenCalled();
    });

    it('Letting the mouse button up should call onMouseUp in the service', () => {
        const mockClick = new MouseEvent('mouseup');

        component.onMouseUp(mockClick);
        expect(mouseServiceSpy.onMouseUp).toHaveBeenCalled();
    });
});
