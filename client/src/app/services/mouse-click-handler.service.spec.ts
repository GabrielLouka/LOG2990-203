import { TestBed } from '@angular/core/testing';

import { MouseHandlerService } from './mouse-handler.service';
import { Coordinate } from '@app/interfaces/coordinate';

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
        // Our setup is already done in the beforeEach()

        service.onMouseDown(startPosition);

        expect(service.startCoordinate.x).toBe(startPosition.x);
        expect(service.startCoordinate.y).toBe(startPosition.y);
    });

    it('onMouseUp should read the mouse pointer position', () => {
        service.onMouseUp(endPosition);

        expect(service.endCoordinate.x).toBe(endPosition.x);
        expect(service.endCoordinate.y).toBe(endPosition.y);
    });

    it('should calculate distance between two points', () => {
        const calculatedDistance = service.calculateDistance(startPosition, endPosition);

        expect(calculatedDistance).toBe(distance);
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

    it('Spy should change what is called when wrapper function is called ', () => {
        service.startCoordinate = startPosition;
        service.endCoordinate = endPosition;

        // We create a fake function that is called instead of printToConsole that does nothing
        const fakePrint = (x: number) => {};

        // We spy on a real function but replace it with our own one
        // Note : printToConsole is private so we need to add <any> before the spy
        //
        // Using a Spy to mock only a part of an objet can be useful but it should be used with caution.
        // Having to use it a lot can mean that your methods are highly coupled and can have side effets.
        const spy = spyOn<any>(service, 'printToConsole').and.callFake(fakePrint);

        const calculatedDistance = service.calculateDistanceWrapper();

        expect(spy).toHaveBeenCalled();
        expect(calculatedDistance).toBe(5);
    });
});
