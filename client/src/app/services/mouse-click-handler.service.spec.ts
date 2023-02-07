import { TestBed } from '@angular/core/testing';

import { Coordinate } from '@app/interfaces/coordinate';
import { MouseHandlerService } from './mouse-handler.service';

describe('MouseHandlerService', () => {
    let service: MouseHandlerService;
    let startPosition: Coordinate;
    let endPosition: Coordinate;
    let distance: number;

    // We have no dependencies to other classes or Angular Components
    // but we can still let Angular handle the objet creation
    beforeEach(() => TestBed.configureTestingModule({}));

    // This runs before each test so we put variables we reuse here
    beforeEach(() => {
        service = TestBed.inject(MouseHandlerService);
        startPosition = { x: 0, y: 0 };
        endPosition = { x: 3, y: 4 };
        distance = 5;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('onMouseDown should read the mouse pointer position', () => {
        service.onMouseDown(startPosition);

        expect(service.startCoordinate.x).toBe(startPosition.x);
        expect(service.startCoordinate.y).toBe(startPosition.y);
    });

    it('should always have a positive or null distance', () => {
        // We can redefine our variables if we need a specific value for the test
        endPosition = { x: -3, y: -4 };

        const calculatedDistance = service.calculateDistance(startPosition, endPosition);
        expect(calculatedDistance).toBeGreaterThanOrEqual(0);
        // Distance should still be the same (5)
        expect(calculatedDistance).toBe(distance);
    });

    it("should calculate a distance of 0 if there's no movement ", () => {
        startPosition = { x: 3, y: 4 };
        distance = 0;

        const calculatedDistance = service.calculateDistance(startPosition, endPosition);
        expect(calculatedDistance).toBe(distance);
    });

    it('should call calculateDistance when wrapper function is called ', () => {
        startPosition = { x: 3, y: 4 };
        service.startCoordinate = startPosition;
        service.endCoordinate = endPosition;

        // We spy on a real function
        // Note : remember to call callThrough() to actually call the function
        const spy = spyOn(service, 'calculateDistance').and.callThrough();

        service.calculateDistanceWrapper();

        // Our spy can detect if the wrapper function called calculateDistance
        // It can also check what values have been passed to it
        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith(service.startCoordinate, service.endCoordinate);
    });
});
