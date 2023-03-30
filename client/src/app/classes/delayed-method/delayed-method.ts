// export class DelayedMethod {
//     static speed: number = 1;

//     private requestId: number | undefined;
//     private isPaused: boolean = false;
//     private isExecuted: boolean = false;
//     private startTime: number | undefined;
//     private elapsed: number = 0;

//     constructor(private readonly method: () => void, private readonly delay: number, private readonly looping: boolean = false) {}

//     start() {
//         this.isExecuted = false;
//         this.isPaused = false;
//         this.startTime = Date.now();
//         this.requestId = requestAnimationFrame(this.loop.bind(this));
//     }

//     pause() {
//         this.isPaused = true;
//         if (this.requestId) {
//             cancelAnimationFrame(this.requestId);
//         }
//     }

//     resume() {
//         if (this.isExecuted && !this.looping) {
//             return;
//         }
//         this.isPaused = false;
//         this.elapsed = this.elapsed / DelayedMethod.speed;
//         this.startTime = Date.now() - this.elapsed;
//         this.requestId = requestAnimationFrame(this.loop.bind(this));
//     }

//     private loop() {
//         if (!this.isPaused) {
//             this.elapsed = Date.now() - (this.startTime ?? 0);
//             const remaining = this.delay / DelayedMethod.speed - this.elapsed;
//             if (remaining <= 0) {
//                 this.method();
//                 this.isExecuted = true;
//                 if (this.looping) {
//                     this.elapsed = 0;
//                     this.startTime = Date.now();
//                 } else {
//                     return;
//                 }
//             }

//             this.requestId = requestAnimationFrame(this.loop.bind(this));
//         }
//     }
// }
export class DelayedMethod {
    static speed: number = 1;
    private requestId: number | undefined;
    private isPaused: boolean = false;
    private isExecuted: boolean = false;
    private startTime: number | undefined;
    private elapsed: number = 0;

    constructor(private readonly method: () => void, private readonly delay: number, private readonly looping: boolean = false) {}

    start() {
        this.isExecuted = false;
        this.isPaused = false;
        this.startTime = Date.now();
        this.requestId = requestAnimationFrame(this.loop.bind(this));
    }

    pause() {
        this.isPaused = true;
        if (this.requestId) {
            cancelAnimationFrame(this.requestId);
        }
    }

    resume() {
        if (this.isExecuted && !this.looping) {
            return;
        }
        this.isPaused = false;
        this.elapsed = this.elapsed / DelayedMethod.speed;
        this.startTime = Date.now() - this.elapsed;
        this.requestId = requestAnimationFrame(this.loop.bind(this));
    }

    private loop() {
        if (!this.isPaused) {
            this.elapsed = (Date.now() - (this.startTime ?? 0)) * DelayedMethod.speed;
            const remaining = this.delay - this.elapsed;

            if (remaining <= 0) {
                this.method();
                this.isExecuted = true;
                if (this.looping) {
                    this.elapsed = 0;
                    this.startTime = Date.now();
                } else {
                    return;
                }
            }
            this.requestId = requestAnimationFrame(this.loop.bind(this));
        }
    }
}
