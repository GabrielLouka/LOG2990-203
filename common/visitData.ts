import { Vector2 } from './vector2';
export interface VisitData {
    alreadyVisited: Map<string, number>;
    allPixelsToVisitSet: Set<string>;
    visitRadius: number;
    imageDimensions: Vector2;
  };