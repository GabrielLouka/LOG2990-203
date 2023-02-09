export class Pixel {
    static readonly white = new Pixel(255, 255, 255);
    static readonly black = new Pixel(0, 0, 0);
    r: number;
    g: number;
    b: number;

    constructor(r: number, g: number, b: number) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    equals = (pixel: Pixel): boolean => {
        return this.r === pixel.r && this.g === pixel.g && this.b === pixel.b;
    };
}

export const REQUIRED_WIDTH = 640;
export const REQUIRED_HEIGHT = 480;
export const INTERVAL_VALUE = 1000;
export const MINUTE = 60;
export const MINUTE_LIMIT = 10;
