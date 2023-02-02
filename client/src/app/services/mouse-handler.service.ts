/* eslint-disable no-console */
import { Injectable } from '@angular/core';
import { Coordinate } from '@app/interfaces/coordinate';

@Injectable({
    providedIn: 'root',
})
export class MouseHandlerService {
    startCoordinate: Coordinate;
    endCoordinate: Coordinate;

    constructor() {
        this.startCoordinate = { x: 0, y: 0 };
        this.endCoordinate = { x: 0, y: 0 };
    }

    onMouseDown(coordinate: Coordinate) {
        this.startCoordinate = coordinate;
        console.log(`Mouse Down on x: ${this.startCoordinate.x} y: ${this.startCoordinate.y}`);
    }

    onMouseUp(coordinate: Coordinate) {
        this.endCoordinate = coordinate;
        console.log(`Mouse Up on x: ${this.endCoordinate.x} y: ${this.endCoordinate.y}`);

        // this.printToConsole(this.calculateDistance(this.startCoordinate, this.endCoordinate));

        // Can call one or the other
        // this.calculateDistanceWrapper();
    }

    calculateDistanceWrapper() {
        const distance = this.calculateDistance(this.startCoordinate, this.endCoordinate);
        // this.printToConsole(distance);
        return distance;
    }

    calculateDistance(startCoordinate: Coordinate, endCoordinate: Coordinate): number {
        const distanceX = Math.abs(endCoordinate.x - startCoordinate.x);
        const distanceY = Math.abs(endCoordinate.y - startCoordinate.y);

        const totalDistance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));

        return totalDistance;
    }

    // private printToConsole(x: number): void {
    //     console.log(`Total distance is ${x}`);
    // }
}
