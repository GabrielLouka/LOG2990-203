/* eslint-disable @typescript-eslint/no-magic-numbers */
import { HttpException } from '@app/classes/http.exception';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as express from 'express';
import * as fs from 'fs';
import { StatusCodes } from 'http-status-codes';
import * as path from 'path';
import * as swaggerJSDoc from 'swagger-jsdoc';
import * as swaggerUi from 'swagger-ui-express';
import { Service } from 'typedi';
import { GamesController } from './controllers/games.controller';
import { ImageProcessingController } from './controllers/image-processing.controller';
import { R_ONLY } from './utils/env';

@Service()
export class Application {
    app: express.Application;
    private readonly internalError: number = StatusCodes.INTERNAL_SERVER_ERROR;
    private readonly swaggerOptions: swaggerJSDoc.Options;

    // eslint-disable-next-line max-params
    constructor(private readonly imageProcessingController: ImageProcessingController, readonly gamesController: GamesController) {
        this.app = express();

        this.swaggerOptions = {
            swaggerDefinition: {
                openapi: '3.0.0',
                info: {
                    title: 'Cadriciel Serveur',
                    version: '1.0.0',
                },
            },
            apis: ['**/*.ts'],
        };

        this.config();

        this.bindRoutes();
    }

    bindRoutes(): void {
        this.app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerJSDoc(this.swaggerOptions)));
        this.app.use('/api/image_processing', this.imageProcessingController.router);
        this.app.use('/api/games', this.gamesController.router);
        this.app.use('/api/images/:gameId/:imgId', (req, res) => {
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            // res.status(200).send('test ' + req.params.gameId + ' / ' + req.params.imgId);

            const imgPath = path.join(R_ONLY.persistentDataFolderPath, req.params.gameId, `${req.params.imgId}.bmp`);

            // Check if the file exists
            fs.access(imgPath, fs.constants.F_OK, (err) => {
                if (err) {
                    // If the file doesn't exist, send a 404 error
                    res.status(404).send('Image not found at ' + imgPath + '');
                } else {
                    // If the file exists, read it and send it as the response
                    fs.readFile(imgPath, (err2, data) => {
                        if (err2) {
                            // If there's an error reading the file, send a 500 error
                            res.status(500).send('Internal server error');
                        } else {
                            // Set the Content-Type header to indicate that it's a BMP image
                            res.setHeader('Content-Type', 'image/bmp');
                            // Send the image data as the response
                            res.send(data);
                        }
                    });
                }
            });
        });
        this.app.use('/', (req, res) => {
            res.redirect('/api/docs');
        });

        this.errorHandling();
    }

    private config(): void {
        // Middlewares configuration
        this.app.use(express.json({ limit: '50mb' }));
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(cookieParser());
        // this.app.use(cors());
        this.app.use(cors({ origin: '*' }));
    }

    private errorHandling(): void {
        // When previous handlers have not served a request: path wasn't found
        this.app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
            const err: HttpException = new HttpException('Not Found');
            next(err);
        });

        // development error handler
        // will print stacktrace
        if (this.app.get('env') === 'development') {
            this.app.use((err: HttpException, req: express.Request, res: express.Response) => {
                res.status(err.status || this.internalError);
                res.send({
                    message: err.message,
                    error: err,
                });
            });
        }

        // production error handler
        // no stacktraces  leaked to user (in production env only)
        this.app.use((err: HttpException, req: express.Request, res: express.Response) => {
            res.status(err.status || this.internalError);
            res.send({
                message: err.message,
                error: {},
            });
        });
    }
}
