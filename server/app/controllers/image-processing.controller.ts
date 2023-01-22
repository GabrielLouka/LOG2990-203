import { Request, Response, Router } from 'express';
import { writeFile } from 'fs';
import { Service } from 'typedi';

const HTTP_STATUS_CREATED = 201;

@Service()
export class ImageProcessingController {
    router: Router;

    // constructor(private readonly imageProcessingService: ImageProcessingService) {
    //     this.configureRouter();
    // }

    constructor() {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.post('/send-image', (req: Request, res: Response) => {
            const buffer = Buffer.from(req.body);

            writeFile('./assets/file.bmp', buffer, (err) => {
                if (err) {
                    // eslint-disable-next-line no-console
                    console.error(err);
                } else {
                    // eslint-disable-next-line no-console
                    console.log('File successfully written.');
                }
            });

            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            // const firstPixel = this.imageProcessingService.getRGB(639, 479, buffer);
            const byteArray: number[] = Array.from(new Uint8Array(buffer));
            res.status(HTTP_STATUS_CREATED).send(JSON.stringify(byteArray));
        });
    }
}
