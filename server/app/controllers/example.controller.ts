import { ExampleService } from '@app/services/example.service';
import { Message } from '@common/message';
import { Request, Response, Router } from 'express';
import { readFileSync, writeFile } from 'fs';
import { Service } from 'typedi';

const HTTP_STATUS_CREATED = 201;

@Service()
export class ExampleController {
    router: Router;

    constructor(private readonly exampleService: ExampleService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();
        /**
         * @swagger
         *
         * definitions:
         *   Message:
         *     type: object
         *     properties:
         *       title:
         *         type: string
         *       body:
         *         type: string
         */

        /**
         * @swagger
         * tags:
         *   - name: Example
         *     description: Default cadriciel endpoint
         *   - name: Message
         *     description: Messages functions
         */

        /**
         * @swagger
         *
         * /api/example:
         *   get:
         *     description: Return current time with hello world
         *     tags:
         *       - Example
         *     produces:
         *       - application/json
         *     responses:
         *       200:
         *         schema:
         *           $ref: '#/definitions/Message'
         *
         */
        this.router.get('/', async (req: Request, res: Response) => {
            // Send the request to the service and send the response
            const time: Message = await this.exampleService.helloWorld();
            res.json(time);
        });

        /**
         * @swagger
         *
         * /api/example/about:
         *   get:
         *     description: Return information about http api
         *     tags:
         *       - Example
         *       - Time
         *     produces:
         *       - application/json
         *     responses:
         *       200:
         *         schema:
         *           $ref: '#/definitions/Message'
         */
        this.router.get('/about', (req: Request, res: Response) => {
            // Send the request to the service and send the response
            res.json(this.exampleService.about());
        });

        /**
         * @swagger
         *
         * /api/example/send:
         *   post:
         *     description: Send a message
         *     tags:
         *       - Example
         *       - Message
         *     requestBody:
         *         description: message object
         *         required: true
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/definitions/Message'
         *             example:
         *               title: Mon Message
         *               body: Je suis envoyé à partir de la documentation!
         *     produces:
         *       - application/json
         *     responses:
         *       201:
         *         description: Created
         */
        this.router.post('/send', (req: Request, res: Response) => {
            const message: Message = req.body;
            this.exampleService.storeMessage(message);
            res.sendStatus(HTTP_STATUS_CREATED);
        });

        this.router.post('/send-image', (req: Request, res: Response) => {
            const buffer = Buffer.from(req.body);
            // eslint-disable-next-line no-console
            console.log(buffer);

            writeFile('./assets/file.bmp', buffer, (err) => {
                if (err) {
                    // eslint-disable-next-line no-console
                    console.error(err);
                } else {
                    // eslint-disable-next-line no-console
                    console.log('File successfully written.');
                }
            });

            const getRGB = (x: number, y: number, filepath: string): { r: number; g: number; b: number } => {
                try {
                    // Read the BMP file
                    const bmpBuffer = readFileSync(filepath);

                    // BMP file header is 54 bytes long, so the pixel data starts at byte 54
                    const pixelStart = 54;

                    // Each pixel is 3 bytes (BGR)
                    const pixelLength = 3;

                    const imageWidthOffset = 18;

                    // Calculate the starting position of the pixel
                    const pixelPosition = (x + y * bmpBuffer.readUInt32LE(imageWidthOffset)) * pixelLength + pixelStart;

                    // Extract the R, G, and B values
                    const b = bmpBuffer.readUInt8(pixelPosition);
                    const g = bmpBuffer.readUInt8(pixelPosition + 1);
                    const r = bmpBuffer.readUInt8(pixelPosition + 2);

                    return { r, g, b };
                } catch (e) {
                    // eslint-disable-next-line no-console
                    console.error(e);
                    return { r: -1, g: -1, b: -1 };
                }
            };

            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            const firstPixel = getRGB(639, 479, './assets/file2.bmp');

            res.status(HTTP_STATUS_CREATED).send(JSON.stringify(firstPixel));
        });

        /**
         * @swagger
         *
         * /api/example/all:
         *   get:
         *     description: Return all messages
         *     tags:
         *       - Example
         *       - Message
         *     produces:
         *      - application/json
         *     responses:
         *       200:
         *         description: messages
         *         schema:
         *           type: array
         *           items:
         *             $ref: '#/definitions/Message'
         */
        this.router.get('/all', (req: Request, res: Response) => {
            res.json(this.exampleService.getAllMessages());
        });
    }
}
