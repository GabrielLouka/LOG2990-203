const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 240;
const HALF_CANVAS_WIDTH = CANVAS_WIDTH / 2;
const HALF_CANVAS_HEIGHT = CANVAS_HEIGHT / 2;
const QUARTER_CANVAS_WIDTH = HALF_CANVAS_WIDTH / 2;
const QUARTER_CANVAS_HEIGHT = HALF_CANVAS_HEIGHT / 2;

const QUADRANTS = [
    { x: 0, y: 0, width: HALF_CANVAS_WIDTH, height: HALF_CANVAS_HEIGHT },
    { x: HALF_CANVAS_WIDTH, y: 0, width: HALF_CANVAS_WIDTH, height: HALF_CANVAS_HEIGHT },
    { x: 0, y: HALF_CANVAS_HEIGHT, width: HALF_CANVAS_WIDTH, height: HALF_CANVAS_HEIGHT },
    { x: HALF_CANVAS_WIDTH, y: HALF_CANVAS_HEIGHT, width: HALF_CANVAS_WIDTH, height: HALF_CANVAS_HEIGHT }
];

const SUB_QUADRANTS: { x: number; y: number; width: number; height: number}[] = [];

for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
        const quadrant = {
            x: i * QUARTER_CANVAS_WIDTH,
            y: j * QUARTER_CANVAS_HEIGHT,
            width: QUARTER_CANVAS_WIDTH,
            height: QUARTER_CANVAS_HEIGHT,
        };                
        SUB_QUADRANTS.push(quadrant);              
    }
}

export { SUB_QUADRANTS, QUADRANTS };
export { CANVAS_HEIGHT, CANVAS_WIDTH, QUARTER_CANVAS_HEIGHT, QUARTER_CANVAS_WIDTH, HALF_CANVAS_HEIGHT, HALF_CANVAS_WIDTH };

